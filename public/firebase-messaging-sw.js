/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAcZckAP087s-Y-3aOodkPuEJNQ9aXD4t8",
  authDomain: "to-do-list-fbdbb.firebaseapp.com",
  projectId: "to-do-list-fbdbb",
  storageBucket: "to-do-list-fbdbb.firebasestorage.app",
  messagingSenderId: "1016376304238",
  appId: "1:1016376304238:web:288e8e47fe41bf75d73c7f",
  measurementId: "G-SC8R22FL6S",
});

const messaging = firebase.messaging();

// Handle background messages from Firebase SDK
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw] Background message received:", payload);
  const title = payload.notification?.title || payload.data?.title || "Task Reminder";
  const body = payload.notification?.body || payload.data?.body || "You have a task due!";
  return self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "task-reminder-" + Date.now(),
    requireInteraction: true,
  });
});

// Fallback: raw push event in case Firebase SDK doesn't handle it
self.addEventListener("push", function (event) {
  console.log("[firebase-messaging-sw] Raw push event received");
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch {
      data = { notification: { title: "Task Reminder", body: event.data.text() } };
    }

    // Only show if Firebase SDK hasn't already handled it
    const title = data.notification?.title || data.data?.title || "Task Reminder";
    const body = data.notification?.body || data.data?.body || "You have a task due!";

    event.waitUntil(
      self.registration.getNotifications().then(function (notifications) {
        // Check if a similar notification was already shown recently
        const isDuplicate = notifications.some(function (n) {
          return n.body === body && n.title === title;
        });
        if (!isDuplicate) {
          return self.registration.showNotification(title, {
            body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "task-push-" + Date.now(),
            requireInteraction: true,
          });
        }
      })
    );
  }
});

// Handle notification click - open the app
self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw] Notification clicked");
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url && "focus" in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
