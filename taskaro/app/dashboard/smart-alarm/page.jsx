"use client";
import React from "react";
import AlarmCard from "@/app/components/smartAlarm/AlarmCard";
import CreateAlarm from "@/app/components/smartAlarm/CreateAlarm";

const mockAlarms = [
  {
    time: "06:00 AM",
    title: "Gym Time",
    repeat: "Mon • Wed • Fri",
    emoji: "🏋️",
    color: "bg-red-100 text-red-600",
    message: "No zero days 💪",
  },
];

const SmartAlarmPage = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">⏰ Smart Alarm</h1>

      {/* UPCOMING */}
      <div className="space-y-3">
        <h2 className="font-medium">Upcoming Alarms</h2>
        {mockAlarms.map((a, i) => (
          <AlarmCard key={i} alarm={a} />
        ))}
      </div>

      {/* CREATE */}
      <CreateAlarm />
    </div>
  );
};

export default SmartAlarmPage;