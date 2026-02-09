// server/src/controllers/githubController.ts
// ==========================================
import { Response } from "express";
import axios from "axios";
import {
  AuthRequest,
  GitHubRepository,
  GitHubBranch,
  GitHubPullRequest,
  GitHubIssue,
  GitHubCommit,
} from "../types/index.js";
import { getFirestore } from "../config/firebase.js";

/**
 * Get user's GitHub repositories
 * GET /api/github/repositories
 */
export const getRepositories = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // Get GitHub access token from Firestore
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData?.githubAccessToken) {
      return res.status(404).json({
        success: false,
        error: "GitHub not connected. Please sign in with GitHub first.",
      });
    }

    // Fetch repositories from GitHub
    const response = await axios.get<GitHubRepository[]>(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${userData.githubAccessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          sort: "updated",
          per_page: 100,
        },
      },
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error("Get repositories error:", error);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || "Failed to fetch repositories",
    });
  }
};

/**
 * Get repository information (branches, PRs, issues, commits)
 * GET /api/github/repositories/:owner/:repo
 */
export const getRepositoryInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { owner, repo } = req.params;

    // Get GitHub access token
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const userData = userDoc.data();

    if (!userData?.githubAccessToken) {
      return res.status(404).json({
        success: false,
        error: "GitHub not connected",
      });
    }

    const headers = {
      Authorization: `Bearer ${userData.githubAccessToken}`,
      Accept: "application/vnd.github.v3+json",
    };

    // Fetch branches, PRs, issues, and commits in parallel
    const [branchesRes, prsRes, issuesRes, commitsRes] = await Promise.all([
      axios.get<GitHubBranch[]>(
        `https://api.github.com/repos/${owner}/${repo}/branches`,
        { headers },
      ),
      axios.get<GitHubPullRequest[]>(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        { headers, params: { state: "all", per_page: 50 } },
      ),
      axios.get<GitHubIssue[]>(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        { headers, params: { state: "all", per_page: 50 } },
      ),
      axios.get<GitHubCommit[]>(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        { headers, params: { per_page: 50 } },
      ),
    ]);

    res.json({
      success: true,
      data: {
        repositoryId: `${owner}/${repo}`,
        branches: branchesRes.data,
        pulls: prsRes.data,
        issues: issuesRes.data.filter(
          (issue) => !issue.hasOwnProperty("pull_request"),
        ), // Filter out PRs from issues
        commits: commitsRes.data,
      },
    });
  } catch (error: any) {
    console.error("Get repository info error:", error);
    res.status(500).json({
      success: false,
      error:
        error.response?.data?.message ||
        "Failed to fetch repository information",
    });
  }
};

/**
 * Attach GitHub item (PR, commit, issue) to a task
 * POST /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach
 * Body: { type: 'pull_request' | 'commit' | 'issue', number?: string, sha?: string, title?: string, url?: string }
 */
export const attachGitHubToTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { boardId, cardId, taskId } = req.params;
    const { type, number, sha, title, url } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: "Type is required (pull_request, commit, or issue)",
      });
    }

    // Store in Firestore
    const db = getFirestore();
    const attachmentRef = await db.collection("github_attachments").add({
      taskId,
      cardId,
      boardId,
      type,
      number: number || null,
      sha: sha || null,
      title: title || null,
      url: url || null,
      createdAt: new Date(),
      createdBy: req.user.uid,
    });

    res.status(201).json({
      success: true,
      data: {
        attachmentId: attachmentRef.id,
        taskId,
        type,
        number,
        sha,
      },
    });
  } catch (error: any) {
    console.error("Attach GitHub to task error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to attach GitHub item",
    });
  }
};

/**
 * Get GitHub attachments for a task
 * GET /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments
 */
export const getTaskGitHubAttachments = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { taskId } = req.params;

    const db = getFirestore();
    const attachmentsSnapshot = await db
      .collection("github_attachments")
      .where("taskId", "==", taskId)
      .get();

    const attachments = attachmentsSnapshot.docs.map((doc) => ({
      attachmentId: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: attachments,
    });
  } catch (error: any) {
    console.error("Get task GitHub attachments error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch attachments",
    });
  }
};

/**
 * Remove GitHub attachment from task
 * DELETE /api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId
 */
export const removeGitHubAttachment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const { attachmentId } = req.params;

    const db = getFirestore();
    await db.collection("github_attachments").doc(attachmentId).delete();

    res.status(204).send();
  } catch (error: any) {
    console.error("Remove GitHub attachment error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove attachment",
    });
  }
};
// ==========================================
