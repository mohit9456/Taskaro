"use client";

import React, { useState, useMemo } from "react";
import AlarmCard from "@/app/components/smartAlarm/AlarmCard";
import CreateAlarm from "@/app/components/smartAlarm/CreateAlarm";
import { useAlarm } from "@/components/provider/AlarmProvider";
import {
  Clock,
  Bell,
  BellRing,
  Sparkles,
  Loader2,
  Volume2,
  Brain,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Zap,
} from "lucide-react";

export default function SmartAlarmPage() {
  const {
    alarms,
    loadingAlarms,
    activeCount,
    nextAlarm,
    fetchAlarms,
    notificationsGranted,
    requestNotificationPermission,
    audioUnlocked,
    testSound,
  } = useAlarm();

  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [requestingNotif, setRequestingNotif] = useState(false);

  const filteredAlarms = useMemo(() => {
    if (filter === "active") return alarms.filter((a) => a.isActive);
    if (filter === "paused") return alarms.filter((a) => !a.isActive);
    return alarms;
  }, [alarms, filter]);

  const handleEnableNotifications = async () => {
    setRequestingNotif(true);
    await requestNotificationPermission();
    setRequestingNotif(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-2">
            <Zap size={12} />
            PRECISION CLOCK & BACKGROUND ENGINE
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-(--color-text) flex items-center gap-2.5">
            <BellRing className="text-blue-500" size={28} />
            Smart Alarms & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) mt-1">
            Precision web-worker scheduler, high-volume sound profiles, and cognitive wake-up challenges.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Test Button */}
          <button
            type="button"
            onClick={() => testSound("gentle-chime")}
            title="Test alarm sound engine and unlock browser audio"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-semibold text-(--color-text) hover:bg-(--hover-card-bg) transition-all cursor-pointer shadow-xs"
          >
            <Play size={13} className="text-blue-500" />
            <span>Test Sound</span>
          </button>

          {/* Active Status Badge */}
          <div className="px-3 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-semibold text-(--color-text) shadow-xs flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-500" />
            <span>{activeCount} Active</span>
          </div>
        </div>
      </div>

      {/* BACKGROUND NOTIFICATION PERMISSION BANNER */}
      {!notificationsGranted && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0 text-amber-500" />
            <span>
              <strong>Allow background ringing:</strong> Enable browser notifications so your alarm rings and alerts you even when Taskaro is running in a minimized or background tab.
            </span>
          </div>
          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={requestingNotif}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs whitespace-nowrap transition cursor-pointer self-start sm:self-auto shadow-xs"
          >
            {requestingNotif ? "Requesting..." : "Enable Background Alerts"}
          </button>
        </div>
      )}

      {/* NEXT UPCOMING ALARM SPOTLIGHT */}
      {nextAlarm && (
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm animate-pulse">
              <span>{nextAlarm.alarm.purpose?.emoji || "⏰"}</span>
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                Next Upcoming Alarm
              </div>
              <div className="text-base sm:text-lg font-bold text-(--color-text) flex items-center gap-2">
                <span>{nextAlarm.formattedTime}</span>
                <span className="text-xs font-normal text-(--color-desc)">
                  ({nextAlarm.relativeText})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Armed & Scheduled
            </span>
          </div>
        </div>
      )}

      {/* OVERVIEW STATS BENTO GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Total Configured</div>
          <p className="text-2xl font-bold text-(--color-text)">{alarms.length}</p>
          <p className="text-[11px] text-(--color-desc)">All saved alarms</p>
        </div>

        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Ringing Active</div>
          <p className="text-2xl font-bold text-emerald-500">{activeCount}</p>
          <p className="text-[11px] text-(--color-desc)">Armed for execution</p>
        </div>

        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Wakeup Challenges</div>
          <p className="text-2xl font-bold text-purple-500">
            {alarms.filter((a) => a.challenge && a.challenge !== "none").length}
          </p>
          <p className="text-[11px] text-(--color-desc)">Anti-snooze puzzles</p>
        </div>

        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Background Clock</div>
          <p className="text-sm font-bold text-blue-500 flex items-center gap-1 pt-1.5">
            <CheckCircle2 size={16} />
            <span>Web Worker Live</span>
          </p>
          <p className="text-[11px] text-(--color-desc)">Immune to tab sleep</p>
        </div>
      </div>

      {/* SCHEDULED ALARMS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
          <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Your Scheduled Alarms ({filteredAlarms.length})</span>
          </h2>

          <div className="flex items-center gap-1 bg-(--hover-card-bg) p-1 rounded-xl border border-(--color-border) text-xs">
            {(["all", "active", "paused"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg capitalize font-semibold transition cursor-pointer ${
                  filter === f
                    ? "bg-(--card-bg) text-(--color-text) shadow-xs"
                    : "text-(--color-desc) hover:text-(--color-text)"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loadingAlarms && alarms.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-xs text-(--color-desc)">Loading smart alarms...</p>
          </div>
        ) : filteredAlarms.length === 0 ? (
          <div className="py-16 text-center bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-(--color-text)">No alarms found</h3>
            <p className="text-xs text-(--color-desc) max-w-sm mx-auto">
              Set an alarm below with your preferred wake-up challenge or custom recurring schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlarms.map((a) => (
              <AlarmCard
                key={a._id}
                alarm={a}
                onRefresh={fetchAlarms}
                onDelete={() => fetchAlarms()}
              />
            ))}
          </div>
        )}
      </div>

      {/* CREATE NEW ALARM COMPONENT */}
      <CreateAlarm onCreated={fetchAlarms} />
    </div>
  );
}
