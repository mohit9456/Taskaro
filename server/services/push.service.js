const admin = require("../config/firebase");

const sendPushNotification = async ({
  token,
  title,
  body,
  data = {},
}) => {
  if (!token) return;

  const message = {
    token,

    // 🔥 DATA ONLY (BEST PRACTICE)
    data: {
      title: String(title),
      body: String(body),
      clickUrl: data.clickUrl || "/dashboard",
      taskId: data.taskId || "",
      type: data.type || "",
    },

    android: {
      priority: "high",
    },

    webpush: {
      headers: {
        Urgency: "high",
      },
    },
  };

  try {
    await admin.messaging().send(message);
    console.log("📨 Push sent");
  } catch (err) {
    console.error("❌ Push failed", err);
  }
};

module.exports = sendPushNotification;
