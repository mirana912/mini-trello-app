// server/src/routes/github.ts
// ==========================================
import { Router } from "express";
import {
  getRepositories,
  getRepositoryInfo,
  attachGitHubToTask,
  getTaskGitHubAttachments,
  removeGitHubAttachment,
} from "../controllers/githubController";
import { verifyFirebaseToken } from "../middleware/auth";

const router = Router();

// All GitHub routes require authentication
router.use(verifyFirebaseToken);

// Repository routes
router.get("/repositories", getRepositories);
router.get("/repositories/:owner/:repo", getRepositoryInfo);

// Task attachment routes
router.post(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach",
  attachGitHubToTask,
);
router.get(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments",
  getTaskGitHubAttachments,
);
router.delete(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId",
  removeGitHubAttachment,
);

export default router;
// ==========================================
