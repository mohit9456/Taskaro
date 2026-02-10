import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { protectedApiPost } from "./api";

export const requestFcmToken = async () => {
  if (!messaging) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  if (token) {
    await protectedApiPost("/secure/fcm-token", { token });
  }
};
