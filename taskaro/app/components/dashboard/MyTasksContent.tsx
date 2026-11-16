"use client";

import React, { useEffect, useState, useMemo } from "react";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import axios from "axios";
import {
  CheckSquare,
  Search,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  X,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

export interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "inprogress" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MyTasksContent() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "todo" | "inprogress" | "done">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortBy, setSortBy] = useState<"newest" | "dueDate" | "priority">("newest");

  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // Modal / Drawer state for Create & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: new Date().toISOString().split("T")[0],
    status: "todo" as "todo" | "inprogress" | "done",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await protectedApiGet("/secure/tasks/list");
      const list = res?.data?.task || res?.task || [];
      setTasks(list);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      description: "",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      status: "todo",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task: TaskItem) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: task.status || "todo",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setFormError("Task title is required");
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      if (editingTask) {
        // Update
        const payload = {
          taskId: editingTask._id,
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          dueDate: taskForm.dueDate,
          status: taskForm.status,
        };

        const res = await axios.post("/api/secure/tasks/update", payload);
        const updated = res.data?.task;

        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? { ...t, ...payload, ...updated } : t))
        );
      } else {
        // Create
        const payload = {
          title: taskForm.title.trim(),
          description: taskForm.description.trim(),
          priority: taskForm.priority,
          dueDate: taskForm.dueDate,
          assignTo: "self",
        };

        const res = await axios.post("/api/secure/tasks/create", payload);
        const created = res.data?.task || res.data;

        if (created?._id) {
          setTasks((prev) => [created, ...prev]);
        } else {
          fetchTasks();
        }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Could not save task. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle status done/todo
  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus = task.status === "done" ? "todo" : "done";

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: nextStatus } : t))
    );

    try {
      await axios.post("/api/secure/tasks/update", {
        taskId: task._id,
        status: nextStatus,
      });
    } catch (err) {
      console.error("Status update error:", err);
      // Rollback
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, status: task.status } : t))
      );
    }
  };

  // Delete task (soft delete to trash)
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    setSelectedIds((prev) => prev.filter((id) => id !== taskId));

    try {
      await axios.post("/api/secure/tasks/delete", { _id: taskId });
    } catch (err) {
      console.error("Delete task error:", err);
      fetchTasks();
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTasks.map((t) => t._id));
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkMarkStatus = async (status: "todo" | "inprogress" | "done") => {
    if (selectedIds.length === 0) return;
    setIsBulkActionLoading(true);

    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (selectedIds.includes(t._id) ? { ...t, status } : t))
    );

    try {
      await axios.post("/api/secure/tasks/update", {
        taskId: selectedIds,
        status,
      });
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk update error:", err);
      fetchTasks();
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkActionLoading(true);

    const idsToDelete = [...selectedIds];
    setTasks((prev) => prev.filter((t) => !idsToDelete.includes(t._id)));
    setSelectedIds([]);

    try {
      await axios.post("/api/secure/tasks/delete", { _id: idsToDelete });
    } catch (err) {
      console.error("Bulk delete error:", err);
      fetchTasks();
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // Derived counts
  const counts = useMemo(() => {
    return {
      all: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inprogress: tasks.filter((t) => t.status === "inprogress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }, [tasks]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (filterStatus !== "all" && task.status !== filterStatus) return false;
        // Priority filter
        if (filterPriority !== "all" && task.priority !== filterPriority) return false;
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "priority") {
          const order = { high: 3, medium: 2, low: 1 };
          return (order[b.priority] || 0) - (order[a.priority] || 0);
        }
        if (sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        // default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [tasks, filterStatus, filterPriority, searchQuery, sortBy]);

  // Due date status formatting
  const getDueDateLabel = (dueDateString?: string, isDone: boolean = false) => {
    if (!dueDateString) return null;
    const due = new Date(dueDateString);

    if (isDone) {
      return {
        text: "Completed",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Overdue", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" };
    }
    if (diffDays === 0) {
      return { text: "Due Today", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" };
    }
    if (diffDays === 1) {
      return { text: "Due Tomorrow", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" };
    }
    return {
      text: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      color: "text-(--color-desc) bg-(--hover-card-bg) border-(--color-border)",
    };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* WORKSPACE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text)">
            Task Workspace
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) mt-0.5">
            Manage your daily tasks, priority pipeline, and completion milestones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* CONTROLS BAR: SEARCH, TABS, FILTERS & SORT */}
      <div className="p-4 rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xs space-y-4">
        {/* TOP ROW: SEARCH & STATUS TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-(--color-desc) absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or notes..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-desc) hover:text-(--color-text)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* STATUS TABS */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { key: "all", label: "All", count: counts.all },
                { key: "todo", label: "To Do", count: counts.todo },
                { key: "inprogress", label: "In Progress", count: counts.inprogress },
                { key: "done", label: "Done", count: counts.done },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === tab.key
                    ? "bg-(--hover-card-bg) text-(--color-primary) border border-(--color-border)"
                    : "text-(--color-desc) hover:text-(--color-text)"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70 px-1.5 py-0.2 rounded-full bg-(--color-border)">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ROW: PRIORITY & SORT DROPDOWNS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-(--color-border) text-xs">
          <div className="flex items-center gap-2">
            <span className="text-(--color-desc) font-medium text-[11px] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Priority:
            </span>
            <div className="flex items-center rounded-xl bg-(--hover-card-bg) p-0.5 border border-(--color-border)">
              {(["all", "high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPriority(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                    filterPriority === p
                      ? "bg-(--card-bg) text-(--color-text) shadow-xs"
                      : "text-(--color-desc) hover:text-(--color-text)"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-(--color-desc) font-medium text-[11px] flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="dueDate">Due date (Soonest)</option>
              <option value="priority">Priority (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS FLOATING TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-semibold animate-in fade-in duration-150">
          <div className="flex items-center gap-2 pl-2">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedIds.length} tasks selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkMarkStatus("done")}
              disabled={isBulkActionLoading}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer text-[11px]"
            >
              Mark Done
            </button>
            <button
              onClick={() => handleBulkMarkStatus("todo")}
              disabled={isBulkActionLoading}
              className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border) transition-colors cursor-pointer text-[11px]"
            >
              Mark To Do
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkActionLoading}
              className="px-3 py-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Trash</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-(--color-desc) hover:text-(--color-text) px-2"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* TASKS TABLE / LIST CARD */}
      <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xs overflow-hidden">
        {/* TABLE HEADER */}
        <div className="p-4 border-b border-(--color-border) flex items-center justify-between text-xs text-(--color-desc) font-medium">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="p-1 rounded text-(--color-desc) hover:text-(--color-text) cursor-pointer"
              title="Select all filtered"
            >
              {selectedIds.length === filteredTasks.length && filteredTasks.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-(--color-primary)" />
              ) : (
                <div className="w-4 h-4 rounded border border-(--color-border)" />
              )}
            </button>
            <span>Task Title</span>
          </div>

          <div className="flex items-center gap-8 pr-2">
            <span className="hidden sm:inline">Priority</span>
            <span className="hidden md:inline">Due Date</span>
            <span>Actions</span>
          </div>
        </div>

        {/* TASKS CONTENT */}
        <div className="divide-y divide-(--color-border)">
          {loading ? (
            <div className="p-12 text-center text-xs text-(--color-desc) flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-(--color-primary)" />
              <span>Loading workspace tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-(--color-primary) flex items-center justify-center mx-auto">
                <CheckSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-(--color-text)">
                {searchQuery || filterStatus !== "all" || filterPriority !== "all"
                  ? "No tasks match your filters"
                  : "Your task workspace is clear!"}
              </p>
              <p className="text-xs text-(--color-desc) max-w-sm mx-auto">
                {searchQuery || filterStatus !== "all"
                  ? "Try resetting filters or searching for something else."
                  : "Add your high-priority items and start executing with clarity."}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-(--color-primary) hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === "done";
              const isSelected = selectedIds.includes(task._id);
              const dueInfo = getDueDateLabel(task.dueDate, isDone);

              return (
                <div
                  key={task._id}
                  className={`p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-(--hover-card-bg)/60 transition-colors group ${
                    isSelected ? "bg-blue-500/5" : ""
                  }`}
                >
                  {/* Left: Checkbox & Toggle & Title */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Bulk checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(task._id)}
                      className="p-1 rounded text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-(--color-primary)" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-(--color-border) group-hover:border-(--color-desc)" />
                      )}
                    </button>

                    {/* Status Circle toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      className="shrink-0 text-(--color-desc) hover:text-(--color-primary) transition-colors cursor-pointer"
                      title={isDone ? "Mark as to-do" : "Mark as done"}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 hover:stroke-(--color-primary)" />
                      )}
                    </button>

                    {/* Title & Description */}
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

                  {/* Right: Meta & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Priority pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md capitalize hidden sm:inline ${
                        task.priority === "high"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          : task.priority === "medium"
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Due date badge */}
                    {dueInfo && (
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md border hidden md:inline ${dueInfo.color}`}
                      >
                        {dueInfo.text}
                      </span>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-lg text-(--color-desc) hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Move to trash"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE / EDIT TASK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
              <h2 className="text-lg font-bold text-(--color-text)">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              {/* Task Title */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-(--color-text)">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Finalize Q4 Project Roadmap"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
                  autoFocus
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-(--color-text)">
                  Description & Details
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Add context, sub-items, or deliverables..."
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all resize-none"
                />
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Priority Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-(--hover-card-bg) p-1 border border-(--color-border)">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTaskForm((prev) => ({ ...prev, priority: p }))}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                          taskForm.priority === p
                            ? p === "high"
                              ? "bg-rose-500 text-white shadow-xs"
                              : p === "medium"
                              ? "bg-amber-500 text-white shadow-xs"
                              : "bg-blue-500 text-white shadow-xs"
                            : "text-(--color-desc) hover:text-(--color-text)"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date Picker */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-(--color-text)">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-primary)/30"
                  />
                </div>
              </div>

              {/* Status if editing */}
              {editingTask && (
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-semibold text-(--color-text)">
                    Execution Status
                  </label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-(--hover-card-bg) p-1 border border-(--color-border)">
                    {(["todo", "inprogress", "done"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTaskForm((prev) => ({ ...prev, status: s }))}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                          taskForm.status === s
                            ? "bg-(--color-primary) text-white shadow-xs"
                            : "text-(--color-desc) hover:text-(--color-text)"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--color-border)">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-(--color-primary) hover:bg-blue-600 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingTask ? "Update Task" : "Create Task"}</span>
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
