"use client";
import React from "react";

const AlarmProgressRing = ({ seconds }) => {
  return (
    <div className="relative w-40 h-40 rounded-full border-8 border-blue-500 flex items-center justify-center">
      <span className="text-3xl font-bold">{seconds}s</span>
      <p className="absolute -bottom-6 text-sm text-gray-500">
        Alarm auto-stops
      </p>
    </div>
  );
};

export default AlarmProgressRing;