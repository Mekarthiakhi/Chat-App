importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAmhCIsUNioSxbzQ3150ph7AB-cFgO0Hek",
  authDomain: "chat-app-4a8f5.firebaseapp.com",
  projectId: "chat-app-4a8f5",
  storageBucket: "chat-app-4a8f5.firebasestorage.app",
  messagingSenderId: "366462906419",
  appId: "1:366462906419:web:125ed1e42eb4f443f9b346",
  databaseURL: "https://chat-app-4a8f5-default-rtdb.firebaseio.com",
});

const messaging = firebase.messaging();

// Handle background messages (when the app tab is not focused or closed)
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "New Message", {
    body: body || "",
    icon: icon || "/vite.svg",
    badge: "/vite.svg",
    vibrate: [200, 100, 200],
    tag: payload.data?.chatId || "chat-notification",
    renotify: true,
    data: { url: self.location.origin }, // Store the app URL for click handling
  });
});

// When user clicks the notification, open the chat app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || self.location.origin;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If the app is already open in a tab, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      return clients.openWindow(url);
    })
  );
});
