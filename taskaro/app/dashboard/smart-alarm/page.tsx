"use client";

import React, { useEffect, useState, useMemo } from "react";
import AlarmCard, { AlarmItem } from "@/app/components/smartAlarm/AlarmCard";
import CreateAlarm from "@/app/components/smartAlarm/CreateAlarm";
import { protectedApiGet } from "@/lib/api";
import {
  Clock,
  Bell,
  BellRing,
  Sparkles,
  Plus,
  Loader2,
  Calendar,
  Volume2,
  CheckCircle2,
} from "lucide-react";

export default function SmartAlarmPage() {
  const [alarms, setAlarms] = useState<AlarmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const data = await protectedApiGet("/secure/alarm/list");
      setAlarms(data?.alarms ?? []);
    } catch (err) {
      console.error("Failed to load alarms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const filteredAlarms = useMemo(() => {
    if (filter === "active") return alarms.filter((a) => a.isActive);
    if (filter === "paused") return alarms.filter((a) => !a.isActive);
    return alarms;
  }, [alarms, filter]);

  const activeCount = useMemo(() => alarms.filter((a) => a.isActive).length, [alarms]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-(--color-text)">
                Smart Alarms & Reminders
              </h1>
              <p className="text-xs sm:text-sm text-(--color-desc)">
                Personalized wake-up schedules, sound profiles, and discipline challenges.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-semibold text-(--color-text) shadow-xs flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-500" />
            <span>{activeCount} Active Alarms</span>
          </div>
        </div>
      </div>

      {/* OVERVIEW STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Total Scheduled</div>
          <p className="text-2xl font-bold text-(--color-text)">{alarms.length}</p>
          <p className="text-[11px] text-(--color-desc)">Alarms configured</p>
        </div>

        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="text-xs text-(--color-desc) font-medium">Ringing Active</div>
          <p className="text-2xl font-bold text-emerald-500">{activeCount}</p>
          <p className="text-[11px] text-(--color-desc)">Armed for execution</p>
        </div>

        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="text-xs text-(--color-desc) font-medium">Wakeup Protection</div>
          <p className="text-2xl font-bold text-purple-500">
            {alarms.filter((a) => a.challenge && a.challenge !== "none").length}
          </p>
          <p className="text-[11px] text-(--color-desc)">Anti-snooze challenges</p>
        </div>
      </div>

      {/* UPCOMING & LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
          <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Your Scheduled Alarms ({filteredAlarms.length})</span>
          </h2>

          <div className="flex items-center gap-1 bg-(--color-bg) p-1 rounded-xl border border-(--color-border) text-xs">
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

        {loading ? (
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
                onDelete={(id) => setAlarms((prev) => prev.filter((item) => item._id !== id))}
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
