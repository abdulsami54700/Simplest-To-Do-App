/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

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

messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || "Task Reminder";
  const options = {
    body: payload.notification?.body || "You have a task due!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };
  self.registration.showNotification(title, options);
});
