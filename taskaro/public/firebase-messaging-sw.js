importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCB_4xSHsWXvNHcXEicxeq__cslZE3Lldk",
  authDomain: "taskaro-b0786.firebaseapp.com",
  projectId: "taskaro-b0786",
  messagingSenderId: "766417117351",
  appId: "1:766417117351:web:a7b6bd826525d08a7ebb82",
});

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background payload", payload);

  const { title, body, clickUrl } = payload.data;

  self.registration.showNotification(title, {
    body,
    icon: "https://www.vyugmetaverse.com/images/Blog/blog21.webp",
    image: "https://www.vyugmetaverse.com/_next/static/media/logo.e286b66d.webp",
    data: {
      clickUrl,
    },
    actions: [
      { action: "open", title: "🔍 View Task" },
      { action: "dismiss", title: "❌ Dismiss" },
    ],
    requireInteraction: true,
  });
});
