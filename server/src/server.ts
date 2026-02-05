// server/src/server.ts
// ==========================================
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config, validateConfig } from "./config";
import { initializeFirebaseAdmin } from "./config/firebase";

// Import routes
import authRoutes from "./routes/auth";
import githubRoutes from "./routes/github";

// Initialize Express app
const app = express();

// Initialize Firebase Admin
initializeFirebaseAdmin();

// Validate configuration
validateConfig();

// Middleware
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Mini Trello API Server is running",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Welcome to Mini Trello API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: {
        github: "/api/auth/github",
        githubCallback: "/api/auth/github/callback",
        sendCode: "/api/auth/send-code",
        verifyCode: "/api/auth/verify-code",
      },
      github: {
        repositories: "/api/github/repositories",
        repositoryInfo: "/api/github/repositories/:owner/:repo",
        attachToTask:
          "/api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach",
        taskAttachments:
          "/api/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments",
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    error:
      config.nodeEnv === "development" ? err.message : "Internal server error",
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log("Mini Trello API Server Started");
  console.log("=====================================");
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Frontend URL: ${config.frontendUrl}`);
  console.log(`API Docs: http://localhost:${PORT}/`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
  console.log("=====================================\n");
});

export default app;
