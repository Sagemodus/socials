// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDjimJJcGiL1O_6Swpzp2d5xaA5-AI4CpI",
  authDomain: "procon-14ef5.firebaseapp.com",
  projectId: "procon-14ef5",
  storageBucket: "procon-14ef5.appspot.com",
  messagingSenderId: "598092499566",
  appId: "1:598092499566:web:7bdfebff0c1dd13a2df47f",
  measurementId: "G-QX73B8G7V6"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/barcelona.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});