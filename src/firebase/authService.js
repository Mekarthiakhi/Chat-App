import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Register a new user and send verification email.
 */
export async function registerUser(email, password, username) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;

  // 1. Send verification email
  await sendEmailVerification(user);

  // 2. Save username
  if (username) {
    await updateProfile(user, { displayName: username });
  }

  return {
    user: {
      uid: user.uid,
      name: username || user.email,
      email: user.email,
      emailVerified: user.emailVerified,
    },
  };
}

/**
 * Login and check if email is verified.
 */
export async function loginUser(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const user = res.user;

  if (!user.emailVerified) {
    // We throw a custom error so the UI can handle it
    const error = new Error("Please verify your email before logging in.");
    error.code = "auth/email-not-verified";
    throw error;
  }

  const token = await user.getIdToken();
  return {
    token,
    user: {
      uid: user.uid,
      name: user.displayName || user.email,
      email: user.email,
    },
  };
}

/**
 * Resend verification email to the currently signed-in user.
 */
export async function resendVerificationEmail() {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  } else {
    throw new Error("No user is currently signed in.");
  }
}
