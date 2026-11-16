"use client";

import {
  startAlarmSound,
  stopAlarmSound,
  previewAlarmSound,
  unlockAudio,
} from "@/lib/alarmAudio";

// 🔊 GLOBAL PLAY
export const playAlarm = (alarmId?: string) => {
  startAlarmSound("classic", 80, true);
};

// 🛑 GLOBAL STOP
export const stopAlarm = () => {
  stopAlarmSound();
};

export const testAlarm = (soundType?: "classic" | "gentle-chime" | "energetic" | "radar") => {
  previewAlarmSound(soundType);
};

export const unlockAlarmAudio = () => {
  unlockAudio();
};

// 🎧 Backward-compatible hook
export const useAlarmSystem = () => {
  // Handled by AlarmProvider
};
