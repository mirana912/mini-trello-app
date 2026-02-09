// server/src/controllers/emailController.ts
// ==========================================
import { Request, Response } from "express";
import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import { getFirestore } from "../config/firebase.js";
import { VerificationCodeData } from "../types/index.js";

// Create email transporter
const createTransporter = () => {
  if (!config.emailUser || !config.emailPassword) {
    console.warn("Email credentials not configured");
    return null;
  }

  return nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
  });
};

/**
 * Generate random 6-digit code
 */
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification code to email
 * POST /api/auth/send-code
 * Body: { email: string }
 */
export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    // Generate verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in Firestore
    const db = getFirestore();
    await db.collection("verification_codes").doc(email).set({
      email,
      code,
      expiresAt,
      createdAt: new Date(),
    });

    // Send email
    const transporter = createTransporter();

    if (transporter) {
      const mailOptions = {
        from: config.emailFrom,
        to: email,
        subject: "Mini Trello - Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0066cc;">Mini Trello Verification Code</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${code}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">Mini Trello - Real-Time Board Management</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: "Verification code sent to email",
      });
    } else {
      // Development mode - return code in response
      console.log(`Verification code for ${email}: ${code}`);

      res.json({
        success: true,
        message: "Verification code generated",
        // Only in development
        ...(config.nodeEnv === "development" && { code }),
      });
    }
  } catch (error: any) {
    console.error("Send verification code error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to send verification code",
    });
  }
};

/**
 * Verify code
 * POST /api/auth/verify-code
 * Body: { email: string, code: string }
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and code are required",
      });
    }

    // Get code from Firestore
    const db = getFirestore();
    const codeDoc = await db.collection("verification_codes").doc(email).get();

    if (!codeDoc.exists) {
      return res.status(404).json({
        success: false,
        error: "No verification code found for this email",
      });
    }

    const codeData = codeDoc.data() as VerificationCodeData;

    // Check if expired
    if (new Date() > codeData.expiresAt) {
      return res.status(400).json({
        success: false,
        error: "Verification code has expired",
      });
    }

    // Check if code matches
    if (codeData.code !== code) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Delete used code
    await db.collection("verification_codes").doc(email).delete();

    res.json({
      success: true,
      message: "Code verified successfully",
    });
  } catch (error: any) {
    console.error("Verify code error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify code",
    });
  }
};
// ==========================================
