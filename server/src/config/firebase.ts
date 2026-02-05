// server/src/config/firebase.ts
// ==========================================
import admin from "firebase-admin";
import { config } from "./index";

let firebaseApp: admin.app.App;

export const initializeFirebaseAdmin = () => {
  if (!firebaseApp) {
    try {
      // Initialize Firebase Admin SDK
      if (
        config.firebasePrivateKey &&
        config.firebaseClientEmail &&
        config.firebaseProjectId
      ) {
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.firebaseProjectId,
            clientEmail: config.firebaseClientEmail,
            privateKey: config.firebasePrivateKey,
          }),
        });
        console.log("Firebase Admin initialized");
      } else {
        console.warn(
          "Firebase Admin credentials not found. Some features may not work.",
        );
      }
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
    }
  }
  return firebaseApp;
};

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.auth();
};

export const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return admin.firestore();
};

export default firebaseApp;
// ==========================================
