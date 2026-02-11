// server/src/config/index.ts
// ==========================================
import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env.local
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

export const config = {
  // Server
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // JWT
  jwtSecret:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // GitHub OAuth
  githubClientId: process.env.GITHUB_CLIENT_ID || "",
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  githubCallbackUrl:
    process.env.GITHUB_CALLBACK_URL ||
    "http://localhost:5001/api/auth/github/callback",

  // Firebase Admin
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  firebasePrivateKey:
    process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "",

  // Email (Nodemailer)
  emailService: process.env.EMAIL_SERVICE || "gmail",
  emailUser: process.env.EMAIL_USER || "",
  emailPassword: process.env.EMAIL_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@minitrello.com",
};

// Validate required config
export const validateConfig = () => {
  const required = ["jwtSecret", "githubClientId", "githubClientSecret"];

  const missing = required.filter((key) => !config[key as keyof typeof config]);

  if (missing.length > 0) {
    console.warn(
      `Warning: Missing environment variables: ${missing.join(", ")}`,
    );
    console.warn("Some features may not work properly.");
  }
};
export default config;
// ==========================================
