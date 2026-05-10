import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAmhCIsUNioSxbzQ3150ph7AB-cFgO0Hek",
  authDomain: "chat-app-4a8f5.firebaseapp.com",
  projectId: "chat-app-4a8f5",
  storageBucket: "chat-app-4a8f5.firebasestorage.app",
  messagingSenderId: "366462906419",
  appId: "1:366462906419:web:125ed1e42eb4f443f9b346",
  measurementId: "G-T8VK6M8BNF",
  databaseURL: "https://chat-app-4a8f5-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Use initializeFirestore with long polling to prevent "INTERNAL ASSERTION FAILED" errors
// This is more stable in Vite environments when the connection is interrupted.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const rtdb = getDatabase(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;