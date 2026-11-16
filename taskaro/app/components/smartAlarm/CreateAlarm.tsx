"use client";

import React, { useState } from "react";
import AlarmPurposeSelector from "./AlarmPurposeSelector";
import { protectedApiPost } from "@/lib/api";
import {
  Clock,
  Volume2,
  Brain,
  Repeat,
  Sparkles,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Vibrate,
} from "lucide-react";

interface CreateAlarmProps {
  onCreated?: () => void;
}

export default function CreateAlarm({ onCreated }: CreateAlarmProps) {
  const [label, setLabel] = useState("");
  const [purpose, setPurpose] = useState<any>(null);
  const [time, setTime] = useState("06:30");
  const [repeat, setRepeat] = useState("Everyday");
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [sound, setSound] = useState<"classic" | "gentle-chime" | "energetic" | "radar">("gentle-chime");
  const [challenge, setChallenge] = useState<"none" | "math" | "quote">("none");
  const [snoozeDuration, setSnoozeDuration] = useState(5);
  const [gradualVolume, setGradualVolume] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (day: string) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleCreateAlarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (repeat === "Custom" && customDays.length === 0) {
      setErrorMsg("Please select at least one day for custom repeat.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        label: label.trim() || purpose?.label || "Alarm",
        time,
        repeat,
        customDays: repeat === "Custom" ? customDays : [],
        message: message.trim(),
        purpose: purpose || { label: "Wake Up", emoji: "⏰", color: "from-blue-500 to-indigo-600" },
        sound,
        challenge,
        snoozeDuration,
        gradualVolume,
        vibration,
      };

      await protectedApiPost("/secure/alarm/create", payload);
      setSuccessMsg("Smart alarm created and scheduled!");

      // Reset
      setLabel("");
      setMessage("");

      if (onCreated) {
        onCreated();
      }

      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to schedule smart alarm. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleCreateAlarm}
      className="p-5 sm:p-6 rounded-3xl border border-(--color-border) bg-(--card-bg) text-(--color-text) space-y-6 shadow-xs transition-colors"
    >
      <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-(--color-text) flex items-center gap-2">
            <Clock className="w-5 h-5 text-(--color-primary)" />
            <span>Create Smart Alarm</span>
          </h2>
          <p className="text-xs text-(--color-desc)">
            Set wake-up times, snooze rules, and anti-procrastination challenges.
          </p>
        </div>
      </div>

      {/* Inline Feedback Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Purpose & Emoji */}
      <div>
        <label className="block text-xs font-semibold text-(--color-text) mb-2">
          Alarm Purpose & Category
        </label>
        <AlarmPurposeSelector value={purpose} onChange={setPurpose} />
      </div>

      {/* Title / Label & Time Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
            Alarm Label / Title
          </label>
          <input
            type="text"
            placeholder="e.g. Morning Gym & Stretch, Team Standup"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
            Alarm Time *
          </label>
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-primary)/30"
          />
        </div>
      </div>

      {/* Repeat Schedule */}
      <div>
        <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
          Repeat Schedule
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["Everyday", "Weekdays", "Custom"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRepeat(r)}
              className={`py-2 px-3 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                repeat === r
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "border-(--color-border) bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text)"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {repeat === "Custom" && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 animate-in fade-in">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`w-10 h-8 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  customDays.includes(day)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--color-border) bg-(--hover-card-bg) text-(--color-desc)"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sound & Wake-Up Challenge Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-(--color-text) mb-1.5 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-blue-500" />
            <span>Sound Profile</span>
          </label>
          <select
            value={sound}
            onChange={(e) => setSound(e.target.value as any)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
          >
            <option value="classic">🔔 Classic Bell</option>
            <option value="gentle-chime">🍃 Gentle Chime (Soothing)</option>
            <option value="energetic">⚡ Energetic Beat (High Energy)</option>
            <option value="radar">🚨 Radar Siren (Heavy Sleeper)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-(--color-text) mb-1.5 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-500" />
            <span>Wake-up Challenge</span>
          </label>
          <select
            value={challenge}
            onChange={(e) => setChallenge(e.target.value as any)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
          >
            <option value="none">None (Standard dismiss)</option>
            <option value="math">🧮 Math Puzzle (Solve to stop)</option>
            <option value="quote">💬 Motivational Quote (Read to stop)</option>
          </select>
        </div>
      </div>

      {/* Snooze & Extra Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div>
          <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
            Snooze Duration
          </label>
          <select
            value={snoozeDuration}
            onChange={(e) => setSnoozeDuration(Number(e.target.value))}
            className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-2 p-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
          <span className="text-xs font-semibold text-(--color-text)">Gradual Volume</span>
          <input
            type="checkbox"
            checked={gradualVolume}
            onChange={(e) => setGradualVolume(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-center gap-2 p-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
          <span className="text-xs font-semibold text-(--color-text)">Vibration</span>
          <input
            type="checkbox"
            checked={vibration}
            onChange={(e) => setVibration(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Motivational Note */}
      <div>
        <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
          Morning Motivational Note
        </label>
        <input
          type="text"
          placeholder="e.g. Today is your day to conquer! Wake up strong."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 border-t border-(--color-border) flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scheduling Alarm...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Set Smart Alarm</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
