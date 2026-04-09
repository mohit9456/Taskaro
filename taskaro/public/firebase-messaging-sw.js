importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCB_4xSHsWXvNHcXEicxeq__cslZE3Lldk",
  authDomain: "taskaro-b0786.firebaseapp.com",
  projectId: "taskaro-b0786",
  messagingSenderId: "766417117351",
  appId: "1:766417117351:web:a7b6bd826525d08a7ebb82",
});

const messaging = firebase.messaging();

// 🔥 HELPER → send message to all tabs
const notifyAllClients = (message) => {
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage(message);
      });
    });
};

// 🔥 HELPER → safe API call
const postApi = (url, data) => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((err) => {
    console.error("❌ API ERROR:", err);
  });
};

// ✅ BACKGROUND PUSH
messaging.onBackgroundMessage((payload) => {
  try {
    const { title, body, clickUrl, alarmId, type } = payload.data || {};
    const upperType = type?.toUpperCase();

    console.log("📩 BACKGROUND PAYLOAD:", payload);

    // 🔔 SHOW NOTIFICATION
    self.registration.showNotification(title, {
      body,
      icon: "https://www.vyugmetaverse.com/_next/static/media/logo.e286b66d.webp",
      data: payload.data,
      requireInteraction: upperType === "ALARM_RING",
      actions:
        upperType === "ALARM_RING"
          ? [
              { action: "snooze", title: "😴 Snooze" },
              { action: "done", title: "✅ Done" },
            ]
          : [
              { action: "open", title: "🔍 View Task" },
              { action: "dismiss", title: "❌ Dismiss" },
            ],
    });

    // 🔊 ALARM → notify all open tabs
    if (upperType === "ALARM_RING") {
      notifyAllClients({
        type: "ALARM_RING",
        alarmId,
      });
    }
  } catch (err) {
    console.error("❌ SW ERROR:", err);
  }
});

// ✅ NOTIFICATION CLICK
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  const { alarmId, clickUrl = "/" } = data;

  console.log("🔔 Notification click:", event.action);

  // 😴 SNOOZE
  if (event.action === "snooze") {
    postApi("/api/secure/alarm/snooze", { alarmId });

    notifyAllClients({ type: "STOP_ALARM" });

    return;
  }

  // ✅ DONE
  if (event.action === "done") {
    postApi("/api/secure/alarm/done", { alarmId });

    notifyAllClients({ type: "STOP_ALARM" });

    return;
  }

  // 🌐 OPEN / FOCUS TAB
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 🔥 already open tab
        for (const client of clientList) {
          if (client.url.includes(clickUrl) && "focus" in client) {
            client.focus();

            client.postMessage({
              type: "ALARM_RING",
              alarmId,
            });

            return;
          }
        }

        // 🔥 open new tab
        return self.clients.openWindow(clickUrl).then((client) => {
          // wait for load
          setTimeout(() => {
            client?.postMessage({
              type: "ALARM_RING",
              alarmId,
            });
          }, 1500);
        });
      })
  );
});