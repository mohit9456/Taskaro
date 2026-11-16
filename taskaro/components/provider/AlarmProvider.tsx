"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import {
  startAlarmSound,
  stopAlarmSound,
  previewAlarmSound,
  unlockAudio,
} from "@/lib/alarmAudio";
import AlarmRingModal from "@/app/components/smartAlarm/AlarmRingModal";
import { AlarmItem } from "@/app/components/smartAlarm/AlarmCard";

interface NextAlarmInfo {
  alarm: AlarmItem;
  formattedTime: string;
  relativeText: string;
  diffMinutes: number;
}

interface AlarmContextType {
  alarms: AlarmItem[];
  loadingAlarms: boolean;
  activeCount: number;
  ringingAlarm: AlarmItem | null;
  audioUnlocked: boolean;
  notificationsGranted: boolean;
  nextAlarm: NextAlarmInfo | null;
  fetchAlarms: () => Promise<void>;
  dismissRingingAlarm: (alarmId: string) => Promise<void>;
  snoozeRingingAlarm: (alarmId: string, minutes: number) => Promise<void>;
  testSound: (soundType?: "classic" | "gentle-chime" | "energetic" | "radar") => void;
  requestNotificationPermission: () => Promise<boolean>;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export const useAlarm = () => {
  const ctx = useContext(AlarmContext);
  if (!ctx) {
    throw new Error("useAlarm must be used within an AlarmProvider");
  }
  return ctx;
};

export default function AlarmProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [loadingAlarms, setLoadingAlarms] = useState(false);
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const alarmsRef = useRef<AlarmItem[]>([]);
  alarmsRef.current = alarms;

  const lastRungKeyRef = useRef<string | null>(null);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationsGranted(Notification.permission === "granted");
    }
  }, []);

  // Unlock Audio on first user interaction
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUnlock = () => {
      unlockAudio();
      setAudioUnlocked(true);
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  // Fetch alarms from API
  const fetchAlarms = useCallback(async () => {
    if (!session?.user) return;
    try {
      setLoadingAlarms(true);
      const res = await protectedApiGet("/secure/alarm/list");
      if (res?.alarms && Array.isArray(res.alarms)) {
        setAlarms(res.alarms);
      }
    } catch (err) {
      console.warn("Failed to load alarms in AlarmProvider:", err);
    } finally {
      setLoadingAlarms(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchAlarms();
  }, [fetchAlarms]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const res = await Notification.requestPermission();
      const granted = res === "granted";
      setNotificationsGranted(granted);
      return granted;
    } catch {
      return false;
    }
  };

  // Trigger Ringing
  const triggerAlarm = useCallback((alarm: AlarmItem) => {
    setRingingAlarm(alarm);

    // 1. Play Sound
    startAlarmSound(
      alarm.sound || "classic",
      alarm.volume ?? 80,
      alarm.gradualVolume !== false
    );

    // 2. Vibration
    if (alarm.vibration && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 600]);
      } catch {}
    }

    // 3. Browser Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`⏰ Wake Up! ${alarm.label || "Smart Alarm"}`, {
          body: alarm.message || "Time to conquer your scheduled tasks!",
          icon: "/Logo3.png",
          requireInteraction: true,
        });
      } catch {}
    }
  }, []);

  // Clock Check Handler
  const checkAlarms = useCallback(() => {
    const activeList = alarmsRef.current.filter((a) => a.isActive);
    if (activeList.length === 0) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDay = days[now.getDay()];
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    for (const alarm of activeList) {
      if (alarm.time !== currentTime) continue;

      let matchesDay = false;
      if (alarm.repeat === "Everyday" || alarm.repeat === "Once") {
        matchesDay = true;
      } else if (alarm.repeat === "Weekdays") {
        matchesDay = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(currentDay);
      } else if (alarm.repeat === "Weekends") {
        matchesDay = ["Sat", "Sun"].includes(currentDay);
      } else if (alarm.repeat === "Custom" && Array.isArray(alarm.customDays)) {
        matchesDay = alarm.customDays.includes(currentDay);
      }

      if (matchesDay) {
        const ringKey = `${alarm._id}_${todayStr}_${currentTime}`;
        if (lastRungKeyRef.current !== ringKey) {
          lastRungKeyRef.current = ringKey;
          triggerAlarm(alarm);
          break;
        }
      }
    }
  }, [triggerAlarm]);

  // Background Web Worker Ticker (immune to background tab throttling)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let worker: Worker | null = null;
    let fallbackInterval: any = null;

    try {
      const blob = new Blob(
        [
          `setInterval(function() { postMessage("tick"); }, 2000);`,
        ],
        { type: "application/javascript" }
      );
      worker = new Worker(URL.createObjectURL(blob));
      worker.onmessage = () => {
        checkAlarms();
      };
    } catch {
      // Fallback
      fallbackInterval = setInterval(() => {
        checkAlarms();
      }, 2000);
    }

    return () => {
      if (worker) {
        worker.terminate();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [checkAlarms]);

  // Dismiss Alarm
  const dismissRingingAlarm = async (alarmId: string) => {
    stopAlarmSound();
    setRingingAlarm(null);

    try {
      await protectedApiPost("/secure/alarm/done", { alarmId });
      // If it was a "Once" alarm, mark as inactive locally
      setAlarms((prev) =>
        prev.map((a) => {
          if (a._id === alarmId && a.repeat === "Once") {
            return { ...a, isActive: false };
          }
          return a;
        })
      );
    } catch (err) {
      console.warn("Error marking alarm done:", err);
    }
  };

  // Snooze Alarm
  const snoozeRingingAlarm = async (alarmId: string, minutes: number) => {
    stopAlarmSound();
    setRingingAlarm(null);

    try {
      await protectedApiPost("/secure/alarm/snooze", {
        alarmId,
        snoozeMinutes: minutes,
      });
      // Refresh alarms to get the new snoozed time
      fetchAlarms();
    } catch (err) {
      console.warn("Error snoozing alarm:", err);
    }
  };

  // Test Sound
  const testSound = (soundType = "gentle-chime") => {
    previewAlarmSound(soundType as any);
  };

  // Calculate Next Alarm
  const nextAlarm = useMemo<NextAlarmInfo | null>(() => {
    const activeList = alarms.filter((a) => a.isActive);
    if (activeList.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let bestDiff = Infinity;
    let bestAlarm: AlarmItem | null = null;
    let isNextDay = false;

    for (const a of activeList) {
      const [h, m] = a.time.split(":").map(Number);
      const alarmTotalMinutes = h * 60 + m;

      let diff = alarmTotalMinutes - currentMinutes;
      if (diff <= 0) {
        // Rings tomorrow (add 24h)
        diff += 24 * 60;
      }

      if (diff < bestDiff) {
        bestDiff = diff;
        bestAlarm = a;
        isNextDay = alarmTotalMinutes <= currentMinutes;
      }
    }

    if (!bestAlarm) return null;

    const diffHours = Math.floor(bestDiff / 60);
    const diffMins = bestDiff % 60;
    const relativeText =
      diffHours > 0
        ? `in ${diffHours} hr ${diffMins} min`
        : `in ${diffMins} minutes`;

    const dayPrefix = isNextDay ? "Tomorrow" : "Today";
    const formattedTime = `${dayPrefix} at ${bestAlarm.time}`;

    return {
      alarm: bestAlarm,
      formattedTime,
      relativeText,
      diffMinutes: bestDiff,
    };
  }, [alarms]);

  const activeCount = useMemo(() => alarms.filter((a) => a.isActive).length, [alarms]);

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        loadingAlarms,
        activeCount,
        ringingAlarm,
        audioUnlocked,
        notificationsGranted,
        nextAlarm,
        fetchAlarms,
        dismissRingingAlarm,
        snoozeRingingAlarm,
        testSound,
        requestNotificationPermission,
      }}
    >
      {children}

      {/* GLOBAL RINGING MODAL */}
      {ringingAlarm && (
        <AlarmRingModal
          alarm={ringingAlarm}
          onDismiss={dismissRingingAlarm}
          onSnooze={snoozeRingingAlarm}
        />
      )}
    </AlarmContext.Provider>
  );
}
