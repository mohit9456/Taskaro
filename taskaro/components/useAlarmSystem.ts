"use client";

import { protectedApiPost } from "@/lib/api";
import { getMessaging, onMessage } from "firebase/messaging";
import { useEffect } from "react";

let alarmAudio: HTMLAudioElement | null = null;
let alarmTimer: NodeJS.Timeout | null = null;

// 🔊 GLOBAL PLAY
export const playAlarm = (alarmId?: string) => {
  if (alarmAudio) alarmAudio.pause();
  if (alarmTimer) clearTimeout(alarmTimer);

  alarmAudio = new Audio("/alarm.wav");
  alarmAudio.loop = true;

  alarmAudio.play().catch(() => {
    console.log("User interaction required for audio autoplay");
  });

  alarmTimer = setTimeout(() => {
    stopAlarm();
    if (alarmId) {
      protectedApiPost("/secure/alarm/done", { alarmId });
    }
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
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      const { type, alarmId } = event.data || {};

      if (type === "ALARM_RING") {
        playAlarm(alarmId);
      }

      if (type === "STOP_ALARM") {
        stopAlarm();
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handler);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const messaging = getMessaging();

      onMessage(messaging, (payload) => {
        console.log("📩 FOREGROUND:", payload);

        const { title, body, alarmId, type } = (payload.data as any) || {};

        if (Notification.permission === "granted" && title) {
          new Notification(title, {
            body,
            icon: "/task-aro.png",
          });
        }

        if (type === "ALARM_RING") {
          playAlarm(alarmId);
        }
      });
    } catch {
      // Firebase messaging might not be initialized
    }
  }, []);
};

