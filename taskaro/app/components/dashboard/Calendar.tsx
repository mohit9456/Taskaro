"use client";

import React, { useEffect, useState, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import {
  CalendarDays,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  Loader2,
  Calendar as CalendarIcon,
  X,
  ListTodo,
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
} from "lucide-react";

export interface CalendarTask {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function CalendarSection() {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarActiveDate, setCalendarActiveDate] = useState<Date>(new Date());

  // Filters & Views
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("all");
  const [viewTab, setViewTab] = useState<"selected" | "upcoming">("selected");

  // Inline Quick Add
  const [quickTitle, setQuickTitle] = useState("");
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Modal State for full Task Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [modalForm, setModalForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    status: "todo" as "todo" | "inprogress" | "done",
  });
  const [modalError, setModalError] = useState("");
  const [isModalSaving, setIsModalSaving] = useState(false);

  // Delete modal / inline feedback
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await protectedApiGet("/secure/tasks/list");
      if (res?.success && Array.isArray(res.task)) {
        setTasks(res.task);
      } else if (Array.isArray(res)) {
        setTasks(res);
      } else {
        setTasks([]);
      }
    } catch (err: any) {
      console.error("Failed to load tasks for calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Filtered tasks across the entire calendar based on priority/status filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const priorityMatch = filterPriority === "all" || t.priority === filterPriority;
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "done" && t.status === "done") ||
        (filterStatus === "pending" && t.status !== "done");
      return priorityMatch && statusMatch;
    });
  }, [tasks, filterPriority, filterStatus]);

  // Tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [filteredTasks, selectedDate]);

  // Upcoming tasks in the next 14 days
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks
      .filter((t) => {
        if (!t.dueDate || t.status === "done") return false;
        const d = new Date(t.dueDate);
        return d >= today;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 10);
  }, [tasks]);

  // Date stats
  const selectedDateStats = useMemo(() => {
    const total = selectedDateTasks.length;
    const completed = selectedDateTasks.filter((t) => t.status === "done").length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [selectedDateTasks]);

  // Overdue count
  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((t) => {
      if (!t.dueDate || t.status === "done") return false;
      return new Date(t.dueDate) < today;
    }).length;
  }, [tasks]);

  // Fast Toggle Status (Optimistic)
  const handleToggleStatus = async (task: CalendarTask) => {
    const nextStatus: "todo" | "done" = task.status === "done" ? "todo" : "done";
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      await protectedApiPost("/secure/tasks/update", {
        taskId: task._id,
        status: nextStatus,
      });
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
    }
  };

  // Quick inline add task for selected date
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    try {
      setIsQuickAdding(true);
      const dueDate = new Date(selectedDate);
      dueDate.setHours(12, 0, 0, 0);

      const payload = {
        title: quickTitle.trim(),
        description: "",
        priority: "medium",
        dueDate: dueDate.toISOString(),
        assignTo: "self",
      };

      const res = await protectedApiPost("/secure/tasks/create", payload);
      if (res?.success && res.task) {
        setTasks((prev) => [res.task, ...prev]);
      } else {
        await fetchTasks();
      }
      setQuickTitle("");
    } catch (err: any) {
      console.error("Failed to quick add task:", err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setDeletingId(taskId);
      await protectedApiPost("/secure/tasks/delete", { _id: taskId });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err: any) {
      console.error("Failed to delete task:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    const dateStr = selectedDate.toISOString().split("T")[0];
    setModalForm({
      title: "",
      description: "",
      priority: "medium",
      date: dateStr,
      time: "10:00",
      status: "todo",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (task: CalendarTask) => {
    setEditingTask(task);
    let dateStr = selectedDate.toISOString().split("T")[0];
    let timeStr = "10:00";

    if (task.dueDate) {
      const d = new Date(task.dueDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split("T")[0];
        timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      }
    }

    setModalForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      date: dateStr,
      time: timeStr,
      status: task.status || "todo",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // Save Modal Form (Create or Edit)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.title.trim()) {
      setModalError("Please provide a task title.");
      return;
    }

    try {
      setIsModalSaving(true);
      setModalError("");

      let combinedDueDate = new Date().toISOString();
      if (modalForm.date) {
        const [year, month, day] = modalForm.date.split("-").map(Number);
        const [hours, minutes] = (modalForm.time || "10:00").split(":").map(Number);
        const d = new Date(year, month - 1, day, hours, minutes, 0);
        combinedDueDate = d.toISOString();
      }

      if (editingTask) {
        // Edit existing task
        const payload = {
          taskId: editingTask._id,
          title: modalForm.title.trim(),
          description: modalForm.description.trim(),
          priority: modalForm.priority,
          status: modalForm.status,
          dueDate: combinedDueDate,
        };

        const res = await protectedApiPost("/secure/tasks/update", payload);
        if (res?.success && res.task) {
          setTasks((prev) =>
            prev.map((t) => (t._id === editingTask._id ? res.task : t))
          );
        } else {
          setTasks((prev) =>
            prev.map((t) =>
              t._id === editingTask._id
                ? {
                    ...t,
                    title: modalForm.title.trim(),
                    description: modalForm.description.trim(),
                    priority: modalForm.priority,
                    status: modalForm.status,
                    dueDate: combinedDueDate,
                  }
                : t
            )
          );
        }
      } else {
        // Create new task
        const payload = {
          title: modalForm.title.trim(),
          description: modalForm.description.trim(),
          priority: modalForm.priority,
          dueDate: combinedDueDate,
          assignTo: "self",
        };

        const res = await protectedApiPost("/secure/tasks/create", payload);
        if (res?.success && res.task) {
          setTasks((prev) => [res.task, ...prev]);
        } else {
          await fetchTasks();
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save task error:", err);
      setModalError(
        err?.response?.data?.error || err?.message || "Failed to save task. Please try again."
      );
    } finally {
      setIsModalSaving(false);
    }
  };

  // Jump to Today
  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarActiveDate(today);
  };

  // React Calendar Tile Content (Indicators)
  const renderTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayTasks = filteredTasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
      );
    });

    if (dayTasks.length === 0) return null;

    const hasHigh = dayTasks.some((t) => t.priority === "high" && t.status !== "done");
    const hasMed = dayTasks.some((t) => t.priority === "medium" && t.status !== "done");
    const hasLow = dayTasks.some((t) => t.priority === "low" && t.status !== "done");
    const allDone = dayTasks.length > 0 && dayTasks.every((t) => t.status === "done");

    return (
      <div className="flex items-center justify-center gap-1 mt-1 w-full px-1">
        {allDone ? (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="All tasks done" />
        ) : (
          <>
            {hasHigh && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="High priority" />}
            {hasMed && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Medium priority" />}
            {hasLow && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Low priority" />}
          </>
        )}
        {dayTasks.length > 3 && (
          <span className="text-[9px] font-semibold text-(--color-desc)">
            +{dayTasks.length}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-(--color-text)">
                Calendar & Planner
              </h1>
              <p className="text-xs sm:text-sm text-(--color-desc)">
                Organize your deadlines, meetings, and daily schedules visually.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action & Today Quick Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToToday}
            className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition-colors shadow-xs"
          >
            Today
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-(--card-bg) border border-(--color-border) p-3 sm:p-4 rounded-xl shadow-xs">
          <div className="text-xs text-(--color-desc) font-medium">Selected Date</div>
          <div className="text-base sm:text-lg font-bold text-(--color-text) mt-0.5 truncate">
            {selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            {selectedDateStats.total} {selectedDateStats.total === 1 ? "task" : "tasks"} scheduled
          </div>
        </div>

        <div className="bg-(--card-bg) border border-(--color-border) p-3 sm:p-4 rounded-xl shadow-xs">
          <div className="text-xs text-(--color-desc) font-medium">Completed on Day</div>
          <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {selectedDateStats.completed}
          </div>
          <div className="text-[11px] text-(--color-desc) mt-0.5">
            {selectedDateStats.pending} remaining
          </div>
        </div>

        <div className="bg-(--card-bg) border border-(--color-border) p-3 sm:p-4 rounded-xl shadow-xs">
          <div className="text-xs text-(--color-desc) font-medium">Upcoming (14d)</div>
          <div className="text-base sm:text-lg font-bold text-(--color-text) mt-0.5">
            {upcomingTasks.length}
          </div>
          <div className="text-[11px] text-(--color-desc) mt-0.5">
            Active pipeline
          </div>
        </div>

        <div className="bg-(--card-bg) border border-(--color-border) p-3 sm:p-4 rounded-xl shadow-xs">
          <div className="text-xs text-(--color-desc) font-medium">Overdue Tasks</div>
          <div className={`text-base sm:text-lg font-bold mt-0.5 ${overdueCount > 0 ? "text-red-500" : "text-emerald-500"}`}>
            {overdueCount}
          </div>
          <div className="text-[11px] text-(--color-desc) mt-0.5">
            {overdueCount > 0 ? "Needs attention" : "All on track"}
          </div>
        </div>
      </div>

      {/* Main Grid: Calendar Left (7 cols), Selected Day Agenda Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Calendar and Filters */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-2xl p-4 sm:p-6 shadow-xs">
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-(--color-border)">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-(--color-desc)" />
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-desc)">
                  Filters:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Priority Filter */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                  aria-label="Filter tasks by priority"
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-(--color-border) bg-(--card-bg) text-(--color-text) outline-none focus:border-(--color-primary) cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  aria-label="Filter tasks by status"
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-(--color-border) bg-(--card-bg) text-(--color-text) outline-none focus:border-(--color-primary) cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending Only</option>
                  <option value="done">Completed Only</option>
                </select>
              </div>
            </div>

            {/* The React Calendar */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs text-(--color-desc)">Loading calendar schedule...</p>
              </div>
            ) : (
              <div className="calendar-wrapper">
                <Calendar
                  value={selectedDate}
                  activeStartDate={calendarActiveDate}
                  onActiveStartDateChange={({ activeStartDate }) => {
                    if (activeStartDate) setCalendarActiveDate(activeStartDate);
                  }}
                  onChange={(val) => {
                    if (val instanceof Date) {
                      setSelectedDate(val);
                    }
                  }}
                  tileContent={renderTileContent}
                  prevLabel={<ChevronLeft className="w-4 h-4" />}
                  nextLabel={<ChevronRight className="w-4 h-4" />}
                  prev2Label={null}
                  next2Label={null}
                />
              </div>
            )}

            {/* Calendar Legend */}
            <div className="mt-5 pt-4 border-t border-(--color-border) flex flex-wrap items-center justify-between text-xs text-(--color-desc) gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Done</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-dashed border-blue-500 inline-block" />
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Day Agenda & Upcoming Deadlines */}
        <div className="lg:col-span-5 space-y-4">
          {/* Day Agenda Card */}
          <div className="bg-(--card-bg) border border-(--color-border) rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col min-h-[460px]">
            {/* View Switcher Tabs (Selected Date vs Upcoming) */}
            <div className="flex items-center justify-between border-b border-(--color-border) pb-3 mb-4">
              <div className="flex items-center gap-1 bg-(--color-bg) p-1 rounded-xl border border-(--color-border)">
                <button
                  onClick={() => setViewTab("selected")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewTab === "selected"
                      ? "bg-(--card-bg) text-(--color-text) shadow-xs"
                      : "text-(--color-desc) hover:text-(--color-text)"
                  }`}
                >
                  Day Agenda
                </button>
                <button
                  onClick={() => setViewTab("upcoming")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    viewTab === "upcoming"
                      ? "bg-(--card-bg) text-(--color-text) shadow-xs"
                      : "text-(--color-desc) hover:text-(--color-text)"
                  }`}
                >
                  Upcoming ({upcomingTasks.length})
                </button>
              </div>

              <button
                onClick={handleOpenCreateModal}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* TAB 1: Day Agenda */}
            {viewTab === "selected" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  {/* Selected Date Header */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {selectedDate.toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </h2>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                        {selectedDateStats.total} {selectedDateStats.total === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                    <p className="text-xs text-(--color-desc) mt-0.5">
                      {selectedDateStats.completed} completed, {selectedDateStats.pending} pending
                    </p>
                  </div>

                  {/* Inline Quick Add Input */}
                  <form onSubmit={handleQuickAdd} className="mb-4">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder={`Quick add task for ${selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}...`}
                        value={quickTitle}
                        onChange={(e) => setQuickTitle(e.target.value)}
                        disabled={isQuickAdding}
                        className="w-full pl-3 pr-20 py-2 text-xs rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary) transition-colors placeholder:text-(--color-desc)"
                      />
                      <button
                        type="submit"
                        disabled={!quickTitle.trim() || isQuickAdding}
                        className="absolute right-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700 transition cursor-pointer flex items-center gap-1"
                      >
                        {isQuickAdding ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Tasks List */}
                  {selectedDateTasks.length === 0 ? (
                    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                        <CalendarCheck2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-(--color-text)">No tasks scheduled</h4>
                      <p className="text-xs text-(--color-desc) mt-1 max-w-[220px]">
                        Enjoy your free time, or schedule something to accomplish today.
                      </p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-4 px-3 py-1.5 text-xs font-medium rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition"
                      >
                        + Create Task with Details
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                      {selectedDateTasks.map((task) => {
                        const isDone = task.status === "done";
                        let timeString = "";
                        if (task.dueDate) {
                          const d = new Date(task.dueDate);
                          timeString = d.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          });
                        }

                        return (
                          <div
                            key={task._id}
                            className={`group p-3 rounded-xl border transition-all ${
                              isDone
                                ? "bg-(--color-bg)/50 border-(--color-border) opacity-70"
                                : "bg-(--card-bg) border-(--color-border) hover:border-(--color-primary)/50 hover:shadow-xs"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {/* Toggle Done Button */}
                              <button
                                onClick={() => handleToggleStatus(task)}
                                aria-label={isDone ? "Mark as to do" : "Mark as done"}
                                className="mt-0.5 text-(--color-desc) hover:text-emerald-500 transition-colors shrink-0 cursor-pointer"
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>

                              {/* Task Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isDone
                                        ? "line-through text-(--color-desc)"
                                        : "text-(--color-text)"
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  {/* Priority Badge */}
                                  <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize shrink-0 ${
                                      task.priority === "high"
                                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                        : task.priority === "medium"
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </div>

                                {task.description && (
                                  <p className="text-[11px] text-(--color-desc) mt-0.5 line-clamp-1">
                                    {task.description}
                                  </p>
                                )}

                                {timeString && (
                                  <div className="flex items-center gap-1 text-[11px] text-(--color-desc) mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{timeString}</span>
                                  </div>
                                )}
                              </div>

                              {/* Quick Actions (Edit / Delete) */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditModal(task)}
                                  aria-label="Edit task"
                                  className="p-1 text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) rounded-md transition cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task._id)}
                                  aria-label="Delete task"
                                  disabled={deletingId === task._id}
                                  className="p-1 text-(--color-desc) hover:text-red-500 hover:bg-red-500/10 rounded-md transition cursor-pointer"
                                >
                                  {deletingId === task._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Upcoming Deadlines */}
            {viewTab === "upcoming" && (
              <div className="flex-1 overflow-y-auto max-h-[420px] pr-1">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-(--color-text)">Next 14 Days</h3>
                  <p className="text-xs text-(--color-desc)">
                    Upcoming deadlines across your calendar.
                  </p>
                </div>

                {upcomingTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-(--color-desc)">
                    No pending tasks due in the next 14 days.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingTasks.map((t) => {
                      const taskDate = new Date(t.dueDate!);
                      const isToday =
                        taskDate.toDateString() === new Date().toDateString();

                      return (
                        <div
                          key={t._id}
                          onClick={() => {
                            setSelectedDate(taskDate);
                            setViewTab("selected");
                          }}
                          className="p-2.5 rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) transition-colors cursor-pointer flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-(--color-text) truncate">
                                {t.title}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                  t.priority === "high"
                                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                    : t.priority === "medium"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                            <div className="text-[11px] text-(--color-desc) mt-0.5 flex items-center gap-1.5">
                              <CalendarIcon className="w-3 h-3" />
                              <span className={isToday ? "font-bold text-blue-500" : ""}>
                                {isToday
                                  ? "Today"
                                  : taskDate.toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-(--color-desc) shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE & EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-(--card-bg) border border-(--color-border) rounded-2xl shadow-2xl p-6 text-(--color-text) animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-(--color-border)">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-(--color-text)">
                  {editingTask ? "Edit Scheduled Task" : "Schedule New Task"}
                </h3>
                <p className="text-xs text-(--color-desc)">
                  {editingTask
                    ? "Update your task details and deadline"
                    : "Add a task directly onto your calendar schedule"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {modalError && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Client review meeting, Quarterly Tax Filing"
                  value={modalForm.title}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary) transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Add notes, agenda items, or links..."
                  value={modalForm.description}
                  onChange={(e) =>
                    setModalForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary) transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={modalForm.date}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={modalForm.time}
                    onChange={(e) =>
                      setModalForm((prev) => ({ ...prev, time: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() =>
                          setModalForm((prev) => ({ ...prev, priority: p }))
                        }
                        className={`py-1.5 text-xs font-semibold rounded-lg border capitalize transition-all cursor-pointer ${
                          modalForm.priority === p
                            ? p === "high"
                              ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold"
                              : p === "medium"
                              ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold"
                              : "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                            : "border-(--color-border) text-(--color-desc) hover:bg-(--hover-card-bg)"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {editingTask && (
                  <div>
                    <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                      Status
                    </label>
                    <select
                      value={modalForm.status}
                      onChange={(e) =>
                        setModalForm((prev) => ({
                          ...prev,
                          status: e.target.value as any,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) outline-none focus:border-(--color-primary) cursor-pointer"
                    >
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-(--color-border) flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSaving}
                  className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isModalSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingTask ? "Save Changes" : "Create Task"}</span>
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
