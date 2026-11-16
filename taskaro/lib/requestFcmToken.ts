import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";
import { protectedApiPost } from "./api";

/**
 * Safely requests and registers FCM device token.
 * Includes automatic IndexedDB recovery for version mismatch errors.
 */
export const requestFcmToken = async (): Promise<void> => {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !messaging
  ) {
    return;
  }

  // Only proceed if the user has already granted permission
  if (Notification.permission !== "granted") {
    return;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await protectedApiPost("/secure/fcm-token", { token });
    }
  } catch (error: any) {
    // If browser has an IndexedDB version mismatch from an older Firebase version:
    if (
      error?.name === "VersionError" ||
      error?.message?.includes("less than the existing version")
    ) {
      try {
        if (typeof window !== "undefined" && window.indexedDB) {
          window.indexedDB.deleteDatabase("firebase-messaging-database");
          window.indexedDB.deleteDatabase("firebase-installations-database");
          window.indexedDB.deleteDatabase("fcm_token_details_db");
        }
      } catch (_) {}
    }

    // Use warn instead of error to avoid triggering the Turbopack development overlay
    console.warn("FCM registration deferred:", error?.message || error);
  }
};
