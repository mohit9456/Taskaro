import Notification from "../models/Notification";
import User from "../models/User";

/**
 * Get notifications for a user by email
 */
export async function getNotificationService(email) {
  if (!email) {
    throw { message: "Email is required", status: 400 };
  }

  const user = await User.findOne({ email }).select("_id");

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const notifications = await Notification.find({
    userId: user._id,
  })
    .sort({ createdAt: -1 })
    .lean();

  return notifications;
}

/**
 * Update notifications for a user by email
 */
export async function updateNotifcationService(email) {
  if (!email) {
    throw { message: "Email is required", status: 400 };
  }

  const user = await User.findOne({ email }).select("_id");

  if (!user) {
    throw { message: "User not found", status: 404 };
  }

  const updatedNotifications = await Notification.updateMany(
    { userId: user._id, isRead: false },
    { $set: { isRead: true } },
  );

  return updatedNotifications;
}

//  genrate FCM Token of Specific User

export async function generateToken({ email, token }) {
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

  await User.findByIdAndUpdate(
    { _id: user?._id },
    {
      fcmToken: token,
    },
  );

  return;
}
