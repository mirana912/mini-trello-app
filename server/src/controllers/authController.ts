// server/src/controllers/authController.ts
// ==========================================
import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { getFirebaseAuth, getFirestore } from "../config/firebase";
import { GitHubTokenResponse, GitHubUser, ApiResponse } from "../types";

/**
 * Initiate GitHub OAuth flow
 * GET /api/auth/github
 */
export const initiateGitHubAuth = (req: Request, res: Response) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&redirect_uri=${config.githubCallbackUrl}&scope=user:email,repo`;

  res.json({
    success: true,
    data: {
      authUrl: githubAuthUrl,
    },
  });
};

/**
 * GitHub OAuth callback
 * GET /api/auth/github/callback?code=xxx
 */
export const handleGitHubCallback = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${config.frontendUrl}/auth/signin?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post<GitHubTokenResponse>(
      "https://github.com/login/oauth/access_token",
      {
        client_id: config.githubClientId,
        client_secret: config.githubClientSecret,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.redirect(`${config.frontendUrl}/auth/signin?error=no_token`);
    }

    // Get user info from GitHub
    const userResponse = await axios.get<GitHubUser>(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const githubUser = userResponse.data;

    // Get user's email if not public
    if (!githubUser.email) {
      const emailResponse = await axios.get(
        "https://api.github.com/user/emails",
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      const primaryEmail = emailResponse.data.find(
        (email: any) => email.primary,
      );
      githubUser.email =
        primaryEmail?.email || `${githubUser.login}@github.com`;
    }

    // Create or update user in Firebase
    let firebaseUser;
    try {
      firebaseUser = await getFirebaseAuth().getUserByEmail(githubUser.email);
    } catch (error) {
      // User doesn't exist, create new one
      firebaseUser = await getFirebaseAuth().createUser({
        email: githubUser.email,
        displayName: githubUser.name || githubUser.login,
        photoURL: githubUser.avatar_url,
        emailVerified: true,
      });
    }

    // Store GitHub access token in Firestore
    const db = getFirestore();
    await db
      .collection("users")
      .doc(firebaseUser.uid)
      .set(
        {
          email: githubUser.email,
          displayName: githubUser.name || githubUser.login,
          photoURL: githubUser.avatar_url,
          githubId: githubUser.id,
          githubLogin: githubUser.login,
          githubAccessToken: access_token,
          updatedAt: new Date(),
        },
        { merge: true },
      );

    // Generate custom token for Firebase Auth
    const customToken = await getFirebaseAuth().createCustomToken(
      firebaseUser.uid,
    );

    // Redirect to frontend with token
    res.redirect(
      `${config.frontendUrl}/auth/callback?token=${customToken}&provider=github`,
    );
  } catch (error: any) {
    console.error("GitHub OAuth error:", error);
    res.redirect(
      `${config.frontendUrl}/auth/signin?error=${encodeURIComponent(
        error.message || "github_auth_failed",
      )}`,
    );
  }
};

/**
 * Get GitHub access token for authenticated user
 * GET /api/auth/github/token
 */
export const getGitHubToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    const db = getFirestore();

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();
    const userData = userDoc.data();

    if (!userData?.githubAccessToken) {
      return res.status(404).json({
        success: false,
        error: "GitHub not connected",
      });
    }

    res.json({
      success: true,
      data: {
        accessToken: userData.githubAccessToken,
        githubLogin: userData.githubLogin,
      },
    });
  } catch (error: any) {
    console.error("Get GitHub token error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get GitHub token",
    });
  }
};
// ==========================================
