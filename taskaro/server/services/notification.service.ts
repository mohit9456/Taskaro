import mongoose from "mongoose";
import Notification from "../models/Notification";
import User from "../models/User";
import Task from "../models/Task";
import { connectToDatabase } from "../db/mongodb";

/**
 * UNIFIED NOTIFICATION CREATOR
 * Dispatches in-app notifications and broadcasts to socket server if available
 */
export async function createNotificationService({
  userId,
  title,
  message,
  type = "GENERAL",
  priority = "medium",
  link = "",
  metadata = {},
}: {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  link?: string;
  metadata?: any;
}) {
  await connectToDatabase();

  if (!userId) return null;

  try {
    const notif = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      title: title.trim(),
      message: message.trim(),
      type: type.toUpperCase(),
      priority,
      link,
      metadata,
      isRead: false,
    });

    // ⚡ Non-blocking live broadcast to Socket.io server
    try {
      const socketServerUrl =
        process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
      fetch(`${socketServerUrl}/api/broadcast-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.toString(),
          notification: notif,
        }),
      }).catch(() => {});
    } catch {}

    return notif;
  } catch (err) {
    console.error("Failed to dispatch notification:", err);
    return null;
  }
}

/**
 * SCAN AND AUTO-NOTIFY OVERDUE TASKS FOR A USER
 */
async function scanUserOverdueTasks(userObjectId: mongoose.Types.ObjectId) {
  try {
    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const overdueTasks = await Task.find({
      assignedTo: userObjectId,
      status: { $nin: ["done", "trash"] },
      isTrashed: false,
      dueDate: { $lt: now },
      $or: [
        { lastOverdueNotifiedAt: null },
        { lastOverdueNotifiedAt: { $lt: oneDayAgo } },
      ],
    }).limit(5);

    for (const task of overdueTasks) {
      await createNotificationService({
        userId: userObjectId,
        title: "⏰ Task Overdue: Deadline Missed",
        message: `Your assigned task '${task.title}' has exceeded its deadline (${new Date(task.dueDate).toLocaleDateString()}). Please update its progress or request an extension.`,
        type: "TASK_OVERDUE",
        priority: "urgent",
        link: "/dashboard/my-tasks",
        metadata: { taskId: task._id },
      });

      task.lastOverdueNotifiedAt = now;
      await task.save().catch(() => {});
    }
  } catch (scanErr) {
    console.error("Error during overdue task scan:", scanErr);
  }
}

/**
 * GET NOTIFICATIONS FOR A USER BY EMAIL OR ID
 */
export async function getNotificationService(emailOrId: string) {
  await connectToDatabase();
  if (!emailOrId) {
    throw { message: "Email or User ID is required", status: 400 };
  }

  let user: any = null;
  if (mongoose.Types.ObjectId.isValid(emailOrId)) {
    user = await User.findById(emailOrId).select("_id email");
  }

  if (!user) {
    user = await User.findOne({ email: emailOrId.toLowerCase() }).select("_id email");
  }

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  // Auto-scan overdue tasks on notification retrieval
  await scanUserOverdueTasks(user._id);

  const notifications = await Notification.find({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
  };
}

/**
 * UPDATE NOTIFICATIONS (MARK ALL OR SPECIFIC AS READ)
 */
export async function updateNotifcationService(
  emailOrId: string,
  notificationId?: string
) {
  await connectToDatabase();
  if (!emailOrId) {
    throw { message: "Email or User ID is required", status: 400 };
  }

  let user: any = null;
  if (mongoose.Types.ObjectId.isValid(emailOrId)) {
    user = await User.findById(emailOrId).select("_id");
  }

  if (!user) {
    user = await User.findOne({ email: emailOrId.toLowerCase() }).select("_id");
  }

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const query: any = { userId: user._id };
  if (notificationId && mongoose.Types.ObjectId.isValid(notificationId)) {
    query._id = new mongoose.Types.ObjectId(notificationId);
  } else {
    query.isRead = false;
  }

  const updatedNotifications = await Notification.updateMany(query, {
    $set: { isRead: true },
  });

  return updatedNotifications;
}

/**
 * GENERATE FCM TOKEN FOR SPECIFIC USER
 */
export async function generateToken({ email, token }: { email: string; token: string }) {
  await connectToDatabase();
  if (!email) {
    throw { message: "Email is required", status: 400 };
  }
  if (!token) {
    throw { message: "Token is missing", status: 400 };
  }

  const user = await User.findOne({ email }).select("_id");

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  await User.findByIdAndUpdate(user._id, {
    fcmToken: token,
  });

  return;
}
