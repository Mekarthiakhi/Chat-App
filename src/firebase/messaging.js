import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

// Replace with your VAPID key from Firebase Console →
// Project Settings → Cloud Messaging → Web Push certificates → Key pair
const VAPID_KEY = "BP_coo54dTVe71zP3Vfbm6QuQrP8nPZgQQd9WK7r8xte3dH7PyTxYUno4E2FBpROEgDsZs1Aq7U7l2Q-sE6Vkkg";

/**
 * Request notification permission and get FCM token.
 * Returns the token string or null if not supported/denied.
 */
export async function requestNotificationPermission() {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return token;
  } catch (err) {
    console.warn("FCM token error:", err);
    return null;
  }
}

/**
 * Listen for foreground messages and show a browser notification.
 * Returns the unsubscribe function.
 */
export function onForegroundMessage(callback) {
  if (!messaging) return () => { };
  return onMessage(messaging, (payload) => {
    // Show native browser notification for foreground messages
    const { title, body } = payload.notification || {};
    if (Notification.permission === "granted" && title) {
      new Notification(title, {
        body: body || "",
        icon: "/vite.svg",
        badge: "/vite.svg",
        vibrate: [200, 100, 200],
      });
    }
    if (callback) callback(payload);
  });
}
