"use client";

import { protectedApiPost } from "@/lib/api";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect } from "react";

let alarmAudio = null;
let alarmTimer = null;

// 🔊 GLOBAL PLAY
export const playAlarm = (alarmId) => {
  if (alarmAudio) alarmAudio.pause();
  if (alarmTimer) clearTimeout(alarmTimer);

  alarmAudio = new Audio("/alarm.wav");
  alarmAudio.loop = true;

  alarmAudio.play().catch(() => {
    console.log("User interaction required");
  });

  alarmTimer = setTimeout(() => {
    stopAlarm();
    protectedApiPost("/secure/alarm/done", { alarmId });
  }, 60000);
};

// 🛑 GLOBAL STOP
export const stopAlarm = () => {
  if (alarmAudio) {
    alarmAudio.pause();
    alarmAudio = null;
  }

  if (alarmTimer) {
    clearTimeout(alarmTimer);
    alarmTimer = null;
  }
};

// 🎧 ONLY LISTENER HOOK
export const useAlarmSystem = () => {
  useEffect(() => {
    const handler = (event) => {
      const { type, alarmId } = event.data || {};

      if (type === "ALARM_RING") {
        playAlarm(alarmId);
      }

      if (type === "STOP_ALARM") {
        stopAlarm();
      }
    };

    navigator.serviceWorker?.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker?.removeEventListener("message", handler);
    };
  }, []);


  useEffect(() => {
  const messaging = getMessaging();

  onMessage(messaging, (payload) => {
    console.log("📩 FOREGROUND:", payload);

    const { title, body, alarmId, type } = payload.data || {};

    // 🔔 ✅ SHOW NOTIFICATION (IMPORTANT)
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/logo.png",
      });
    }

    // 🔊 ALARM SOUND
    if (type === "ALARM_RING") {
      playAlarm(alarmId);
    }
  });
}, []);
};