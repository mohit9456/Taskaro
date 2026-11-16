"use client";

import React, { useEffect, useState, useMemo } from "react";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  X,
  AlertCircle,
  Loader2,
  Dumbbell,
  Droplet,
  BookOpen,
  Brain,
  Coffee,
  HeartPulse,
} from "lucide-react";

export interface HabitItem {
  _id: string;
  title: string;
  description?: string;
  category: "health" | "fitness" | "productivity" | "mindfulness" | "learning" | "lifestyle";
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: string[];
  targetCount: number;
  unit: string;
  timeOfDay: "anytime" | "morning" | "afternoon" | "evening" | "night";
  streak: number;
  bestStreak: number;
  completedDates: string[];
  reminderTime?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  isCompletedToday?: boolean;
}

const CATEGORIES = [
  { id: "health", label: "Health & Wellness", icon: Droplet, color: "text-emerald-500 bg-emerald-500/10" },
  { id: "fitness", label: "Fitness & Sport", icon: Dumbbell, color: "text-rose-500 bg-rose-500/10" },
  { id: "productivity", label: "Productivity", icon: Flame, color: "text-amber-500 bg-amber-500/10" },
  { id: "mindfulness", label: "Mindfulness", icon: Brain, color: "text-purple-500 bg-purple-500/10" },
  { id: "learning", label: "Learning & Growth", icon: BookOpen, color: "text-blue-500 bg-blue-500/10" },
  { id: "lifestyle", label: "Lifestyle", icon: Coffee, color: "text-cyan-500 bg-cyan-500/10" },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitItem | null>(null);
  const [modalForm, setModalForm] = useState({
    title: "",
    description: "",
    category: "health" as HabitItem["category"],
    frequency: "daily" as HabitItem["frequency"],
    targetCount: 1,
    unit: "times",
    timeOfDay: "morning" as HabitItem["timeOfDay"],
    reminderTime: "08:00",
    color: "#3b82f6",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Fetch Habits from API
  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await protectedApiGet("/secure/habits/list");
      if (res?.success && Array.isArray(res.habits)) {
        setHabits(res.habits);
      } else {
        setHabits([]);
      }
    } catch (err: any) {
      console.error("Failed to load habits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Past 7 Days calculation for matrix
  const past7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Filtered habits
  const filteredHabits = useMemo(() => {
    if (selectedFilter === "all") return habits;
    if (selectedFilter === "morning" || selectedFilter === "evening" || selectedFilter === "afternoon") {
      return habits.filter((h) => h.timeOfDay === selectedFilter || h.timeOfDay === "anytime");
    }
    return habits.filter((h) => h.category === selectedFilter);
  }, [habits, selectedFilter]);

  // Dynamic Metrics
  const stats = useMemo(() => {
    const total = habits.length;
    const completedToday = habits.filter((h) => (h.completedDates || []).includes(todayStr)).length;
    const consistencyScore = total > 0 ? Math.round((completedToday / total) * 100) : 0;
    const bestOverallStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);
    return { total, completedToday, consistencyScore, bestOverallStreak };
  }, [habits, todayStr]);

  // Instant Optimistic Check-In Toggle
  const handleToggleHabit = async (habitId: string, dateStr: string = todayStr) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h._id !== habitId) return h;
        const exists = (h.completedDates || []).includes(dateStr);
        const updatedDates = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...(h.completedDates || []), dateStr];
        const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;

        return {
          ...h,
          completedDates: updatedDates,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
          isCompletedToday: updatedDates.includes(todayStr),
        };
      })
    );

    try {
      await protectedApiPost("/secure/habits/toggle", { habitId, date: dateStr });
    } catch (err: any) {
      console.error("Habit toggle error:", err);
      fetchHabits();
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingHabit(null);
    setModalForm({
      title: "",
      description: "",
      category: "health",
      frequency: "daily",
      targetCount: 1,
      unit: "times",
      timeOfDay: "morning",
      reminderTime: "08:00",
      color: "#3b82f6",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (habit: HabitItem) => {
    setEditingHabit(habit);
    setModalForm({
      title: habit.title,
      description: habit.description || "",
      category: habit.category,
      frequency: habit.frequency,
      targetCount: habit.targetCount || 1,
      unit: habit.unit || "times",
      timeOfDay: habit.timeOfDay || "morning",
      reminderTime: habit.reminderTime || "08:00",
      color: habit.color || "#3b82f6",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Delete Habit
  const handleDeleteHabit = async (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h._id !== habitId));
    try {
      await protectedApiPost("/secure/habits/delete", { habitId });
    } catch (err) {
      console.error("Delete habit error:", err);
      fetchHabits();
    }
  };

  // Save Modal Form
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      setModalError("Please enter a habit title.");
      return;
    }

    try {
      setIsSaving(true);
      setModalError("");

      if (editingHabit) {
        const res = await protectedApiPost("/secure/habits/update", {
          habitId: editingHabit._id,
          ...modalForm,
        });
        if (res?.success && res.habit) {
          setHabits((prev) =>
            prev.map((h) => (h._id === editingHabit._id ? { ...h, ...res.habit } : h))
          );
        }
      } else {
        const res = await protectedApiPost("/secure/habits/create", modalForm);
        if (res?.success && res.habit) {
          setHabits((prev) => [res.habit, ...prev]);
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setModalError(err?.response?.data?.error || err?.message || "Failed to save habit");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-linear-to-tr from-amber-500 to-rose-500 text-white shadow-xs">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-(--color-text)">
                Habits & Daily Routines
              </h1>
              <p className="text-xs sm:text-sm text-(--color-desc)">
                Build unbreakable consistency with daily streak tracking and routine targets.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Consistency Score */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Today&apos;s Score</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-(--color-text)">{stats.consistencyScore}%</p>
          <p className="text-[11px] text-(--color-desc)">
            {stats.completedToday} of {stats.total} habits executed
          </p>
        </div>

        {/* Completed Today */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{stats.completedToday}</p>
          <p className="text-[11px] text-(--color-desc)">Locked in for today</p>
        </div>

        {/* Best Streak */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Top Streak</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.bestOverallStreak} Days</p>
          <p className="text-[11px] text-(--color-desc)">Continuous discipline</p>
        </div>

        {/* Active System */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Active Habits</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-500">{stats.total}</p>
          <p className="text-[11px] text-(--color-desc)">Routine rituals</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-(--color-border) text-xs">
        {[
          { id: "all", label: "All Habits" },
          { id: "morning", label: "🌅 Morning" },
          { id: "afternoon", label: "☀️ Midday" },
          { id: "evening", label: "🌙 Evening" },
          { id: "fitness", label: "🏋️ Fitness" },
          { id: "health", label: "🥗 Health" },
          { id: "productivity", label: "⚡ Productivity" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 cursor-pointer ${
              selectedFilter === tab.id
                ? "bg-(--card-bg) border border-(--color-border) text-(--color-primary) shadow-xs"
                : "text-(--color-desc) hover:text-(--color-text)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* HABITS LIST & WEEKLY TRACKER */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
          <p className="text-xs text-(--color-desc)">Loading habits & routines...</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="py-20 text-center bg-(--card-bg) border border-(--color-border) rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Flame className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-(--color-text)">No habits found</h3>
          <p className="text-xs text-(--color-desc) max-w-sm mx-auto">
            Start small with simple daily rituals like morning hydration, reading, or workout sessions.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Habit</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map((habit) => {
            const isCompletedToday = (habit.completedDates || []).includes(todayStr);

            return (
              <div
                key={habit._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCompletedToday
                    ? "bg-(--card-bg) border-emerald-500/30 shadow-xs"
                    : "bg-(--card-bg) border-(--color-border) hover:border-(--color-border)"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Check-in button, Title, Streak */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleToggleHabit(habit._id, todayStr)}
                      aria-label={isCompletedToday ? "Mark uncompleted" : "Mark completed today"}
                      className="mt-0.5 sm:mt-0 text-(--color-desc) hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                    >
                      {isCompletedToday ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                      ) : (
                        <Circle className="w-6 h-6 hover:text-blue-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm sm:text-base font-bold truncate ${
                            isCompletedToday ? "line-through text-(--color-desc)" : "text-(--color-text)"
                          }`}
                        >
                          {habit.title}
                        </span>

                        {/* Streak Badge */}
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{habit.streak || 0}d streak</span>
                        </div>

                        {/* Target badge */}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)">
                          {habit.targetCount} {habit.unit} • {habit.timeOfDay}
                        </span>
                      </div>

                      {habit.description && (
                        <p className="text-xs text-(--color-desc) mt-1 line-clamp-1">
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Past 7 Days Heat-Check & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-(--color-border)">
                    {/* 7-Day Matrix */}
                    <div className="flex items-center gap-1.5">
                      {past7Days.map((d) => {
                        const done = (habit.completedDates || []).includes(d.dateStr);

                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => handleToggleHabit(habit._id, d.dateStr)}
                            title={`${d.dateStr}: ${done ? "Done" : "Missed"}`}
                            className={`w-7 h-8 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                              done
                                ? "bg-emerald-500 text-white shadow-xs"
                                : d.isToday
                                ? "border border-dashed border-blue-500 text-blue-500 bg-blue-500/5"
                                : "bg-(--hover-card-bg) text-(--color-desc)"
                            }`}
                          >
                            <span>{d.dayName}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(habit)}
                        className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition cursor-pointer"
                        title="Edit Habit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHabit(habit._id)}
                        className="p-1.5 rounded-lg text-(--color-desc) hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT HABIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-(--color-text)">
                  {editingHabit ? "Edit Habit Routine" : "Build New Habit Routine"}
                </h3>
                <p className="text-xs text-(--color-desc)">
                  Set your daily target, routine category, and frequency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-(--color-text)">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 20m Morning Workout, Drink 2.5L Water, Read 15 Pages"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-(--color-text)">
                  Description / Motivation
                </label>
                <input
                  type="text"
                  placeholder="Why is this habit important to you?"
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-(--color-text)">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const selected = modalForm.category === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setModalForm({ ...modalForm, category: cat.id as HabitItem["category"] })
                        }
                        className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                          selected
                            ? "border-(--color-primary) bg-blue-500/10 text-(--color-primary)"
                            : "border-(--color-border) text-(--color-desc) hover:bg-(--hover-card-bg)"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">Target Goal</label>
                  <input
                    type="number"
                    min="1"
                    value={modalForm.targetCount}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, targetCount: Number(e.target.value) || 1 })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">Unit</label>
                  <input
                    type="text"
                    placeholder="times, mins, glasses..."
                    value={modalForm.unit}
                    onChange={(e) => setModalForm({ ...modalForm, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none"
                  />
                </div>
              </div>

              {/* Time of Day & Frequency */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">Time of Day</label>
                  <select
                    value={modalForm.timeOfDay}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, timeOfDay: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon / Midday</option>
                    <option value="evening">Evening</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">Frequency</label>
                  <select
                    value={modalForm.frequency}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, frequency: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
                  >
                    <option value="daily">Everyday</option>
                    <option value="weekdays">Weekdays Only</option>
                    <option value="weekends">Weekends Only</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-(--color-border) flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingHabit ? "Save Changes" : "Create Habit"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
