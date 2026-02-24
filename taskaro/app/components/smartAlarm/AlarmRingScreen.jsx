"use client";
import React, { useEffect, useState } from "react";
import AlarmProgressRing from "./AlarmProgressRing";
import { ALARM_MESSAGES } from "./alarmMessages";

const AlarmRingScreen = ({ alarm, onClose }) => {
  const [seconds, setSeconds] = useState(60);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const msgs = ALARM_MESSAGES[alarm.type] || [];
    setMessage(msgs[Math.floor(Math.random() * msgs.length)]);

    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timer);
          onClose(); // auto dismiss
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-999 bg-linear-to-br from-black to-gray-900 text-white flex flex-col justify-between p-6">

      {/* TOP */}
      <div className="text-center mt-10">
        <div className="text-5xl mb-4">{alarm.emoji}</div>
        <h1 className="text-3xl font-bold">{alarm.title}</h1>
        <p className="text-lg opacity-80 mt-2">{alarm.time}</p>
      </div>

      {/* CENTER */}
      <div className="flex flex-col items-center gap-4">
        <AlarmProgressRing seconds={seconds} />
        <p className="italic text-lg text-center opacity-90">
          “{message}”
        </p>
      </div>

      {/* ACTIONS */}
      <div className="space-y-3">
        <button
          onClick={() => onClose("done")}
          className="w-full py-4 rounded-xl bg-green-500 text-black font-semibold text-lg"
        >
          ✅ Start / Done
        </button>

        <button
          onClick={() => onClose("snooze")}
          className="w-full py-4 rounded-xl bg-gray-800 border border-gray-700 text-white"
        >
          😴 Snooze 5 min (2 left)
        </button>
      </div>
    </div>
  );
};

export default AlarmRingScreen;