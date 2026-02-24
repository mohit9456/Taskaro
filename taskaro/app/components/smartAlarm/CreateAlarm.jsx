"use client";
import React, { useState } from "react";
import AlarmPurposeSelector from "./AlarmPurposeSelector";

const CreateAlarm = () => {
  const [purpose, setPurpose] = useState(null);
  const [time, setTime] = useState("06:00");
  const [repeat, setRepeat] = useState("Everyday");
  const [message, setMessage] = useState("");

  return (
    <div className="p-6 rounded-xl border bg-white dark:bg-gray-900 space-y-6">
      <h2 className="text-xl font-semibold">➕ Create Smart Alarm</h2>

      {/* PURPOSE */}
      <div>
        <p className="font-medium mb-2">Why this alarm?</p>
        <AlarmPurposeSelector value={purpose} onChange={setPurpose} />
      </div>

      {/* TIME */}
      <div>
        <p className="font-medium mb-2">Time</p>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border rounded-lg px-3 py-2 w-40"
        />
      </div>

      {/* REPEAT */}
      <div>
        <p className="font-medium mb-2">Repeat</p>
        <select
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option>Everyday</option>
          <option>Weekdays</option>
          <option>Custom</option>
        </select>
      </div>

      {/* MESSAGE */}
      <div>
        <p className="font-medium mb-2">Message (optional)</p>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Wake up. Your goals won't chase themselves."
          className="border rounded-lg px-3 py-2 w-full"
        />
      </div>

      {/* PREVIEW */}
      {purpose && (
        <div className="p-4 rounded-lg bg-gray-50 text-sm italic">
          🔔 Preview: {purpose.emoji} {purpose.label} at {time}
        </div>
      )}

      {/* ACTION */}
      <button className="w-full bg-blue-600 text-white py-3 rounded-xl">
        🚀 Create Smart Alarm
      </button>
    </div>
  );
};

export default CreateAlarm;