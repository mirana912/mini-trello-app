// server/src/middleware/auth.ts
// ==========================================
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getFirebaseAuth } from "../config/firebase";
import { config } from "../config/index";
import { AuthRequest } from "../types/index";

// Verify Firebase token
export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    // Verify with Firebase Admin
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      displayName: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Verify JWT token (for Express-generated tokens)
export const verifyJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided",
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.displayName,
    };

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (token) {
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name,
      };
    }
  } catch (error) {}

  next();
};
// ==========================================
