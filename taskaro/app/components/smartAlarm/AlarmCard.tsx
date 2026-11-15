"use client";
import React from "react";
import { stopAlarm } from "@/components/useAlarmSystem";
import { protectedApiPost } from "@/lib/api";

const AlarmCard = ({ alarm }) => {
  const handleDone = async () => {
    try {
      const res = await protectedApiPost("/secure/alarm/done", {
        alarmId: alarm._id,
      });

      console.log("✅ Alarm DONE success:", res);

      stopAlarm();
    } catch (error) {
      console.error("❌ Alarm DONE failed:", error);
    }
  };

  const handleSnooze = async () => {
    try {
      const res = await protectedApiPost("/secure/alarm/snooze", {
        alarmId: alarm._id,
      });

      console.log("😴 Alarm SNOOZE success:", res);

      stopAlarm();
    } catch (error) {
      console.error("❌ Alarm SNOOZE failed:", error);
    }
  };
  return (
    <div className="flex justify-between items-center p-4 rounded-xl border border-(--color-border) bg-(--card-bg) text-(--color-text) shadow-xs transition-colors">
      <div className="flex gap-3 items-center">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-lg ${alarm?.purpose?.color}`}
        >
          <span className="text-xl">{alarm?.purpose?.emoji}</span>
        </div>

        <div>
          <p className="font-semibold text-(--color-text)">
            {alarm.time} — {alarm?.purpose?.label ? `${alarm.purpose.label} time` : "---"}
          </p>
          <p className="text-sm text-(--color-desc)">
            {alarm.repeat === "Custom"
              ? alarm?.customDays.map((item) => `${item} • `)
              : alarm?.repeat}
          </p>
          <p className="text-xs italic text-(--color-desc)">“{alarm.message}”</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSnooze}
          className="px-3 py-1 text-sm rounded-lg bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border) transition-colors cursor-pointer"
        >
          Snooze
        </button>
        <button
          onClick={handleDone}
          className="px-3 py-1 text-sm rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AlarmCard;
