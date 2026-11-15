"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import axios from "axios";
import {
  CheckSquare,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Flame,
  Droplets,
  Dumbbell,
  BookOpen,
  Calendar as CalendarIcon,
  Trash2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  Filter,
} from "lucide-react";

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt?: string;
}

export default function DashboardContent() {
  const { data: session } = useSession();

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"all" | "active" | "done">("all");

  // Inline Quick Add state
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newDueDate, setNewDueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Daily Routine local state (Water + Habits)
  const [waterMl, setWaterMl] = useState(1250);
  const waterTarget = 2500;
  const [habitsCompleted, setHabitsCompleted] = useState<{
    workout: boolean;
    reading: boolean;
    planning: boolean;
  }>({
    workout: false,
    reading: true,
    planning: false,
  });

  // Fetch active tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await protectedApiGet("/secure/tasks/list");
      const list = res?.data?.task || res?.task || [];
      setTasks(list);
    } catch (err: any) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Quick Add Task handler
  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    setCreateError(null);

    const tempId = "temp-" + Date.now();
    const optimisticTask: TaskItem = {
      _id: tempId,
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDueDate,
      status: "todo",
    };

    // Optimistic UI update
    setTasks((prev) => [optimisticTask, ...prev]);
    setNewTitle("");

    try {
      const res = await axios.post("/api/secure/tasks/create", {
        title: optimisticTask.title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate,
        assignTo: "self",
      });

      // Replace temp with real server task
      const created = res.data?.task || res.data;
      if (created?._id) {
        setTasks((prev) =>
          prev.map((t) => (t._id === tempId ? created : t))
        );
      }
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to create task"
      );
      // Rollback optimistic
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle task completed state
  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === "done" ? "todo" : "done";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      await axios.put("/api/secure/tasks/update", {
        taskId: task._id,
        status: nextStatus,
      });
    } catch (err) {
      console.error("Toggle task error:", err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
    }
  };

  // Soft delete task
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await axios.delete("/api/secure/tasks/delete", {
        data: { _id: taskId },
      });
    } catch (err) {
      console.error("Delete task error:", err);
      fetchTasks();
    }
  };

  // Derived metrics
  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "done").length,
    [tasks]
  );
  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done").length,
    [tasks]
  );
  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks, completedTasks]);

  // Filtered tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (filterTab === "active") return tasks.filter((t) => t.status !== "done");
    if (filterTab === "done") return tasks.filter((t) => t.status === "done");
    return tasks;
  }, [tasks, filterTab]);

  const firstName = session?.user?.name?.split(" ")[0] || "Achiever";
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text)">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) mt-0.5 flex items-center gap-2">
            <span>{todayFormatted}</span>
            <span>•</span>
            <span className="text-(--color-primary) font-semibold">
              {pendingTasks} tasks remaining today
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/my-tasks"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border)/80 transition-colors flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Workspace View</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border)/80 transition-colors flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Today&apos;s Focus</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-(--color-primary)">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-(--color-text)">{tasks.length}</p>
          <p className="text-[11px] text-(--color-desc)">Total active in queue</p>
        </div>

        {/* Pending */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Pending Action</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-500">{pendingTasks}</p>
          <p className="text-[11px] text-(--color-desc)">Requires execution</p>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-500">{completedTasks}</p>
          <p className="text-[11px] text-(--color-desc)">
            {completionRate}% completion rate
          </p>
        </div>

        {/* Habit Streak */}
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-1">
          <div className="flex items-center justify-between text-(--color-desc)">
            <span className="text-xs font-semibold">Daily Routine</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-500">
            {Object.values(habitsCompleted).filter(Boolean).length}/3 Done
          </p>
          <p className="text-[11px] text-(--color-desc)">Daily habit discipline</p>
        </div>
      </div>

      {/* MAIN MISSION CONTROL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: TODAY'S EXECUTION LIST (2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          {/* QUICK ADD INLINE INPUT */}
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <form onSubmit={handleQuickAddTask} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  placeholder="+ Add a new task for today (Press Enter)..."
                  className="flex-1 text-sm px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-(--color-primary) hover:bg-blue-600 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>

              {/* METADATA PICKERS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-(--color-desc)">
                <div className="flex items-center gap-3">
                  {/* Priority selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium">Priority:</span>
                    <div className="flex items-center rounded-lg bg-(--hover-card-bg) p-0.5 border border-(--color-border)">
                      {(["low", "medium", "high"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewPriority(p)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize transition-colors ${
                            newPriority === p
                              ? p === "high"
                                ? "bg-rose-500 text-white"
                                : p === "medium"
                                ? "bg-amber-500 text-white"
                                : "bg-blue-500 text-white"
                              : "text-(--color-desc) hover:text-(--color-text)"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due date picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium">Due:</span>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none"
                    />
                  </div>
                </div>

                <span className="text-[11px] text-(--color-desc) hidden sm:inline">
                  ⚡ Auto-syncs to database
                </span>
              </div>

              {createError && (
                <p className="text-xs text-rose-500 font-medium pl-1">
                  * {createError}
                </p>
              )}
            </form>
          </div>

          {/* TASK LIST CONTAINER */}
          <div className="rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs overflow-hidden">
            {/* TABS HEADER */}
            <div className="p-4 border-b border-(--color-border) flex items-center justify-between">
              <div className="flex items-center gap-1">
                {(["all", "active", "done"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                      filterTab === tab
                        ? "bg-(--hover-card-bg) text-(--color-primary) border border-(--color-border)"
                        : "text-(--color-desc) hover:text-(--color-text)"
                    }`}
                  >
                    {tab}
                    <span className="ml-1.5 opacity-60 text-[10px]">
                      {tab === "all"
                        ? tasks.length
                        : tab === "active"
                        ? pendingTasks
                        : completedTasks}
                    </span>
                  </button>
                ))}
              </div>

              <span className="text-xs text-(--color-desc)">
                {filteredTasks.length} shown
              </span>
            </div>

            {/* TASK ITEMS */}
            <div className="divide-y divide-(--color-border)">
              {loading ? (
                <div className="p-8 text-center text-xs text-(--color-desc) flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-(--color-primary)" />
                  <span>Loading workspace tasks...</span>
                </div>
              ) : filteredTasks.length === 0 ? (
                /* EMPTY STATE */
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-(--color-text)">
                      {filterTab === "done"
                        ? "No completed tasks yet"
                        : "All caught up for today!"}
                    </p>
                    <p className="text-xs text-(--color-desc) max-w-xs mx-auto">
                      {filterTab === "done"
                        ? "Check off tasks above to see them in your completed archive."
                        : "Great work! Add a new task above or take time to recharge."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <div
                      key={task._id}
                      className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-(--hover-card-bg)/50 transition-colors group"
                    >
                      {/* Checkbox & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task)}
                          className="shrink-0 text-(--color-desc) hover:text-(--color-primary) transition-colors cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 hover:stroke-(--color-primary)" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-medium truncate transition-all ${
                              isDone
                                ? "line-through text-(--color-desc)"
                                : "text-(--color-text)"
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-(--color-desc) truncate mt-0.5">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Meta Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${
                            task.priority === "high"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : task.priority === "medium"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* Due date */}
                        {task.dueDate && (
                          <span className="text-[11px] text-(--color-desc) hidden sm:inline">
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task._id)}
                          className="p-1 rounded-lg text-(--color-desc) opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Trash task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY DISCIPLINE & ROUTINE WIDGETS (1 COL) */}
        <div className="space-y-4">
          {/* WATER TRACKER WIDGET */}
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-(--color-text) uppercase tracking-wider">
                  Hydration Target
                </h3>
              </div>
              <span className="text-xs font-bold text-sky-500">
                {waterMl} / {waterTarget} ml
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-(--hover-card-bg) overflow-hidden border border-(--color-border)">
              <div
                className="h-full bg-linear-to-r from-sky-400 to-blue-500 transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, (waterMl / waterTarget) * 100)}%`,
                }}
              />
            </div>

            {/* Quick Add buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setWaterMl((prev) => Math.min(waterTarget + 1000, prev + 250))}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+250 ml</span>
                <span className="text-[10px] opacity-60">Glass</span>
              </button>
              <button
                type="button"
                onClick={() => setWaterMl((prev) => Math.min(waterTarget + 1000, prev + 500))}
                className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>+500 ml</span>
                <span className="text-[10px] opacity-60">Bottle</span>
              </button>
            </div>
          </div>

          {/* DAILY HABIT STREAK WIDGET */}
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-(--color-text) uppercase tracking-wider">
                  Daily Discipline
                </h3>
              </div>
              <Link
                href="/dashboard/habits"
                className="text-[11px] font-semibold text-(--color-primary) hover:underline flex items-center gap-0.5"
              >
                <span>All Habits</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {/* Workout */}
              <button
                type="button"
                onClick={() =>
                  setHabitsCompleted((prev) => ({
                    ...prev,
                    workout: !prev.workout,
                  }))
                }
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  habitsCompleted.workout
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-(--hover-card-bg) border-(--color-border) text-(--color-content)"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <Dumbbell className="w-4 h-4 text-amber-500" />
                  <span>45m Gym / Workout</span>
                </div>
                {habitsCompleted.workout ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-(--color-desc)" />
                )}
              </button>

              {/* Reading / Deep Work */}
              <button
                type="button"
                onClick={() =>
                  setHabitsCompleted((prev) => ({
                    ...prev,
                    reading: !prev.reading,
                  }))
                }
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  habitsCompleted.reading
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-(--hover-card-bg) border-(--color-border) text-(--color-content)"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>30m Reading & Deep Work</span>
                </div>
                {habitsCompleted.reading ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-(--color-desc)" />
                )}
              </button>

              {/* Plan Next Day */}
              <button
                type="button"
                onClick={() =>
                  setHabitsCompleted((prev) => ({
                    ...prev,
                    planning: !prev.planning,
                  }))
                }
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  habitsCompleted.planning
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-(--hover-card-bg) border-(--color-border) text-(--color-content)"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs font-medium">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Night Routine & Tomorrow Plan</span>
                </div>
                {habitsCompleted.planning ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-(--color-desc)" />
                )}
              </button>
            </div>
          </div>

          {/* FOCUS PRODUCTIVITY RING */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-(--card-bg) to-(--hover-card-bg) border border-(--color-border) shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-(--color-text)">Productivity Score</span>
              <span className="font-bold text-emerald-500">{completionRate}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-(--color-border) overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-(--color-desc) leading-relaxed">
              Based on your task execution and routine check-ins today. Keep
              pushing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
