// server/src/routes/auth.ts
// ==========================================
import { Router } from "express";
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  getGitHubToken,
} from "../controllers/authController";
import {
  sendVerificationCode,
  verifyCode,
} from "../controllers/emailController";
import { verifyFirebaseToken } from "../middleware/auth";

const router = Router();

// GitHub OAuth routes
router.get("/github", initiateGitHubAuth);
router.get("/github/callback", handleGitHubCallback);
router.get("/github/token", verifyFirebaseToken, getGitHubToken);

// Email verification routes
router.post("/send-code", sendVerificationCode);
router.post("/verify-code", verifyCode);

export default router;
// ==========================================
