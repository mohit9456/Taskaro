"use client";
import React, { useState } from "react";
import AlarmPurposeSelector from "./AlarmPurposeSelector";
import { protectedApiPost } from "@/lib/api";
import toast from "react-hot-toast";

const CreateAlarm = () => {
  const [purpose, setPurpose] = useState(null);
  const [time, setTime] = useState("06:00");
  const [repeat, setRepeat] = useState("Everyday");
  const [message, setMessage] = useState("");
  const [customDays, setCustomDays] = useState([]);
  const [loaderBtn, setLoaderBtn] = useState(false);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleCreateAlarm = async () => {
    if(repeat === "Custom" && customDays.length === 0) {
      return toast.error("please select custom days")
    }
    setLoaderBtn(true);
    try {
      const data = await protectedApiPost("/secure/alarm/create", {
        time,
        repeat,
        customDays,
        message,
        purpose,
      });
      toast.success(data?.message || "Alarm created successfully ! stay tuned");
    } catch (error) {
      toast.error(
        error?.response.data.error ||
          error?.messaage ||
          "something went wrong try again later",
      );
    } finally {
      setLoaderBtn(false);
    }
  };

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
          className="border rounded-lg px-3 py-2 bg-gray-900"
        >
          <option>Everyday</option>
          <option>Weekdays</option>
          <option>Custom</option>
        </select>
      </div>

      {repeat === "Custom" && (
        <div className="flex flex-wrap gap-2 mt-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`px-3 py-1 rounded-lg border
        ${
          customDays.includes(day)
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

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
        <div className="p-4 rounded-lg bg-gray-700 text-sm italic">
          🔔 Preview: {purpose.emoji} {purpose.label} at {time}
        </div>
      )}

      {/* ACTION */}
      <button
        disabled={loaderBtn}
        onClick={handleCreateAlarm}
        className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-50"
      >
        🚀 Create Smart Alarm
      </button>
    </div>
  );
};

export default CreateAlarm;
