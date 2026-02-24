const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const sendPush = require("../services/push.service");

const { groupByUser, getOverdueStage } = require("../utils/notificationHelper");
const { dueTomorrowText, overdueText } = require("../utils/notificationText");

const startNotificationCron = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ Notification cron started");

    const now = new Date();

    // ---------------- DUE TOMORROW ----------------
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const dueTomorrowTasks = await Task.find({
      dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $ne: "completed" },
    }).lean();

    const dueTomorrowByUser = groupByUser(dueTomorrowTasks);

    for (const userId in dueTomorrowByUser) {
      const tasks = dueTomorrowByUser[userId];

      const exists = await Notification.exists({
        userId,
        type: "DUE_TOMORROW",
      });

      if (exists) continue;

      const message = dueTomorrowText(tasks.length);

      await Notification.create({
        userId,
        title: "⏳ Tasks due tomorrow",
        message,
        type: "DUE_TOMORROW",
      });

      const user = await User.findById(userId).lean();

      await sendPush({
        token: user?.fcmToken,
        title: "⏳ Reminder",
        body: message,
        data: {
          type: "DUE_TOMORROW",
          clickUrl: "/dashboard/my-tasks",
        },
      });
    }

    // ---------------- OVERDUE ----------------
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "completed" },
    }).lean();

    const overdueByUser = groupByUser(overdueTasks);

    for (const userId in overdueByUser) {
      const tasks = overdueByUser[userId];

      const oldest = tasks.reduce((min, t) =>
        t.dueDate < min.dueDate ? t : min,
      );

      const days = Math.floor(
        (now - new Date(oldest.dueDate)) / (1000 * 60 * 60 * 24),
      );

      const stage = getOverdueStage(days);
      if (!stage) continue;

      const exists = await Notification.exists({
        userId,
        type: stage,
      });

      if (exists) continue;

      const message = overdueText(tasks.length, days);

      await Notification.create({
        userId,
        title: "⚠️ Overdue tasks",
        message,
        type: stage,
      });

      const user = await User.findById(userId).lean();

      await sendPush({
        token: user?.fcmToken,
        title: "⚠️ Action needed",
        body: message,
        data: {
          type: stage,
          clickUrl: "/dashboard/my-tasks",
        },
      });
    }

    console.log("✅ Notification cron completed");
  });
};

module.exports = startNotificationCron;
