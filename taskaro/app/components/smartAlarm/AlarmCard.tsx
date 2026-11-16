"use client";

import React, { useState } from "react";
import { stopAlarm } from "@/components/useAlarmSystem";
import { protectedApiPost } from "@/lib/api";
import {
  Clock,
  Volume2,
  Brain,
  Repeat,
  Trash2,
  CheckCircle2,
  Loader2,
  Bell,
  BellOff,
} from "lucide-react";

export interface AlarmItem {
  _id: string;
  label?: string;
  time: string;
  repeat: string;
  customDays?: string[];
  message?: string;
  purpose?: {
    label: string;
    emoji: string;
    color: string;
  };
  sound?: "classic" | "gentle-chime" | "energetic" | "radar";
  volume?: number;
  snoozeDuration?: number;
  challenge?: "none" | "math" | "quote";
  vibration?: boolean;
  gradualVolume?: boolean;
  isActive: boolean;
}

interface AlarmCardProps {
  alarm: AlarmItem;
  onRefresh?: () => void;
  onDelete?: (id: string) => void;
}

export default function AlarmCard({ alarm, onRefresh, onDelete }: AlarmCardProps) {
  const [isActive, setIsActive] = useState(alarm.isActive);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    const nextState = !isActive;
    setIsActive(nextState);
    setIsToggling(true);

    try {
      await protectedApiPost("/secure/alarm/toggle", {
        alarmId: alarm._id,
        isActive: nextState,
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to toggle alarm:", err);
      setIsActive(!nextState); // rollback
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await protectedApiPost("/secure/alarm/delete", { alarmId: alarm._id });
      if (onDelete) {
        onDelete(alarm._id);
      } else if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to delete alarm:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDone = async () => {
    try {
      await protectedApiPost("/secure/alarm/done", { alarmId: alarm._id });
      stopAlarm();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Alarm DONE failed:", error);
    }
  };

  const handleSnooze = async () => {
    try {
      await protectedApiPost("/secure/alarm/snooze", {
        alarmId: alarm._id,
        snoozeMinutes: alarm.snoozeDuration || 5,
      });
      stopAlarm();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Alarm SNOOZE failed:", error);
    }
  };

  const repeatLabel =
    alarm.repeat === "Custom" && alarm.customDays && alarm.customDays.length > 0
      ? alarm.customDays.join(", ")
      : alarm.repeat || "Everyday";

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isActive
          ? "bg-(--card-bg) border-(--color-border) shadow-xs hover:border-(--color-primary)/40"
          : "bg-(--card-bg)/60 border-(--color-border) opacity-70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Time, Purpose Emoji, Title */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 text-2xl ${
              alarm?.purpose?.color || "bg-blue-500/10"
            }`}
          >
            <span>{alarm?.purpose?.emoji || "⏰"}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-(--color-text)">
                {alarm.time}
              </span>

              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-(--hover-card-bg) border border-(--color-border) text-(--color-text)">
                {alarm.label || alarm?.purpose?.label || "Alarm"}
              </span>

              {alarm.challenge && alarm.challenge !== "none" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span className="capitalize">{alarm.challenge} Puzzle</span>
                </span>
              )}

              {alarm.sound && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span className="capitalize">{alarm.sound.replace("-", " ")}</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-(--color-desc) mt-1">
              <span className="flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5" />
                <span>{repeatLabel}</span>
              </span>

              <span>•</span>
              <span>Snooze {alarm.snoozeDuration || 5}m</span>

              {alarm.message && (
                <>
                  <span>•</span>
                  <span className="italic truncate max-w-xs">&ldquo;{alarm.message}&rdquo;</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Toggle Switch & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-(--color-border)">
          {/* Quick Snooze / Dismiss buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSnooze}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border) transition cursor-pointer"
            >
              Snooze
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer shadow-xs"
            >
              Dismiss
            </button>
          </div>

          {/* Active Switch */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            aria-label={isActive ? "Disable alarm" : "Enable alarm"}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                isActive ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-(--color-desc) hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
            title="Delete alarm"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
