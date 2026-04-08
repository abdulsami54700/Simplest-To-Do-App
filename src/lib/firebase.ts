import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAcZckAP087s-Y-3aOodkPuEJNQ9aXD4t8",
  authDomain: "to-do-list-fbdbb.firebaseapp.com",
  projectId: "to-do-list-fbdbb",
  storageBucket: "to-do-list-fbdbb.firebasestorage.app",
  messagingSenderId: "1016376304238",
  appId: "1:1016376304238:web:288e8e47fe41bf75d73c7f",
  measurementId: "G-SC8R22FL6S",
};

const VAPID_KEY = "BBcX6wD13XAPYjZlZYooEkN8t52fU04iLnySOW58g0LrXZCGskT4sLipKAxig_Ph-o9vsJGvW9aD7teYkd1haUA";

const app = initializeApp(firebaseConfig);

let messaging: Messaging | null = null;

function getMessagingInstance(): Messaging | null {
  if (messaging) return messaging;
  try {
    messaging = getMessaging(app);
    return messaging;
  } catch {
    console.warn("Firebase Messaging not supported in this environment");
    return null;
  }
}

export async function requestFCMToken(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const msg = getMessagingInstance();
    if (!msg) return null;

    // Wait for service worker registration
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready;

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      localStorage.setItem("fcm_token", token);
      console.log("FCM Token:", token);
    }
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const msg = getMessagingInstance();
  if (!msg) return () => {};
  return onMessage(msg, callback);
}

export function getStoredFCMToken(): string | null {
  return localStorage.getItem("fcm_token");
}
