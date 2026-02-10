const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const sendPush = require("../services/push.service");

const startNotificationCron = () => {
  // ⏰ Runs every 1 hour
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Notification cron running");

    const now = new Date();

    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setHours(23, 59, 59, 999);

    // 🔔 Due Tomorrow
    const dueTomorrowTasks = await Task.find({
      dueDate: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: { $ne: "completed" },
    }).lean();

    for (const task of dueTomorrowTasks) {
      const exists = await Notification.exists({
        taskId: task._id,
        type: "DUE_TOMORROW",
      });

      if (!exists) {
        await Notification.create({
          userId: task.assignedTo,
          taskId: task._id,
          title: "Task due tomorrow",
          message: `Task "${task.title}" is due tomorrow`,
          type: "DUE_TOMORROW",
        });

        // 🔥 PUSH
        const user = await User.findById(task.assignedTo).lean();

        await sendPush({
          token: user?.fcmToken,
          title: "⏰ Task due tomorrow",
          body: task.title,
          data: {
            taskId: task._id.toString(),
            type: "DUE_TOMORROW",
          },
        });
      }
    }

    // ⚠️ Overdue
    const overdueTasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: "completed" },
    }).lean();

    for (const task of overdueTasks) {
      const exists = await Notification.exists({
        taskId: task._id,
        type: "OVERDUE",
      });

      if (!exists) {
        await Notification.create({
          userId: task.assignedTo,
          taskId: task._id,
          title: "Task overdue",
          message: `Task "${task.title}" is overdue`,
          type: "OVERDUE",
        });

        const user = await User.findById(task.assignedTo).lean();

        const data = await sendPush({
          token: user?.fcmToken,
          title: "⚠️ Task overdue",
          body: task.title,
          data: {
            taskId: task._id.toString(),
            type: "OVERDUE",
          },
        });        
      }
    }

    console.log("✅ Notification cron completed");
  });
};

module.exports = startNotificationCron;
