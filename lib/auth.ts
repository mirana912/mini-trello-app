// lib/auth.ts
// ==========================================
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUser } from "./firestore";

// Generate a random 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Sign in with email
export const signInWithEmail = async (
  email: string,
  password: string = "dummy-password",
) => {
  try {
    // Using Firebase's email/password auth in real
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with GitHub
export const signInWithGitHub = async () => {
  try {
    const provider = new GithubAuthProvider();
    provider.addScope("repo");
    provider.addScope("user");

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create user in Firestore if doesn't exist
    await createUser(user.uid, user.email!, user.displayName || undefined);

    // Get GitHub access token
    const credential = GithubAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    return { user, accessToken };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Send verification code via email
export const sendVerificationCode = async (email: string): Promise<string> => {
  const code = generateVerificationCode();

  // Return the code for development
  console.log(`Verification code for ${email}: ${code}`);

  return code;
};

// Verify code
export const verifyCode = async (
  email: string,
  code: string,
): Promise<boolean> => {
  return true;
};
// ==========================================
