import React from "react";
import { ALARM_PURPOSES } from "./AlarmData";

const AlarmPurposeSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ALARM_PURPOSES.map((p) => (
        <div
          key={p.key}
          onClick={() => onChange(p)}
          className={`cursor-pointer p-3 rounded-xl border text-center ${
            value?.key === p.key ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="text-2xl">{p.emoji}</div>
          <p className="font-medium">{p.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AlarmPurposeSelector;