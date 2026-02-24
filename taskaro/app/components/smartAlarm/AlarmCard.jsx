"use client";
import React from "react";

const AlarmCard = ({ alarm }) => {
  return (
    <div className="flex justify-between items-center p-4 rounded-xl border bg-white dark:bg-gray-900">
      <div className="flex gap-3 items-center">
        <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${alarm.color}`}>
          <span className="text-xl">{alarm.emoji}</span>
        </div>

        <div>
          <p className="font-semibold">
            {alarm.time} — {alarm.title}
          </p>
          <p className="text-sm text-gray-500">{alarm.repeat}</p>
          <p className="text-xs italic text-gray-400">
            “{alarm.message}”
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1 text-sm rounded-lg bg-gray-100">
          Snooze
        </button>
        <button className="px-3 py-1 text-sm rounded-lg bg-green-500 text-white">
          Done
        </button>
      </div>
    </div>
  );
};

export default AlarmCard;