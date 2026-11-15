"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import {
  Trash2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Inbox,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface TrashedTask {
  _id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  trashedAt?: string;
  dueDate?: string;
}

export default function Trash() {
  const [trashTasks, setTrashTasks] = useState<TrashedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fetchTrashTasks = async () => {
    setLoading(true);
    try {
      const data = await protectedApiGet("/secure/tasks/trashList");
      if (data?.trash && Array.isArray(data.trash)) {
        setTrashTasks(data.trash);
      } else {
        setTrashTasks([]);
      }
    } catch (error: any) {
      console.error("Failed to load trash tasks:", error);
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load trashed items.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashTasks();
  }, []);

  const restoreTask = async (id: string, title: string) => {
    try {
      setRestoringId(id);
      setFeedback(null);
      await protectedApiPost("/secure/tasks/restore", { _id: id });
      setTrashTasks((prev) => prev.filter((task) => task._id !== id));
      setFeedback({
        type: "success",
        message: `Task "${title}" restored to your active tasks!`,
      });
    } catch (error: any) {
      console.error("Failed to restore task:", error);
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.error ||
          error?.message ||
          "Failed to restore task.",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-(--color-text)">
                Trash Bin
              </h1>
              <p className="text-xs sm:text-sm text-(--color-desc)">
                Recover deleted tasks or review items waiting to be cleared.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/my-tasks"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Tasks</span>
        </Link>
      </div>

      {/* Inline Feedback Alerts */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-75 hover:opacity-100 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Box */}
      <div className="bg-(--card-bg) border border-(--color-border) rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-(--color-border)">
          <h2 className="text-sm sm:text-base font-bold text-(--color-text)">
            Deleted Tasks ({trashTasks.length})
          </h2>
          <span className="text-[11px] text-(--color-desc)">
            Items are automatically kept safe until restored
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader />
          </div>
        ) : trashTasks.length > 0 ? (
          <div className="divide-y divide-(--color-border)">
            {trashTasks.map((task) => (
              <div
                key={task._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-(--color-text) line-through opacity-80 truncate">
                      {task.title}
                    </span>
                    {task.priority && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                          task.priority === "high"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : task.priority === "medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-(--color-desc) mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-(--color-desc) mt-1">
                    {task.trashedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Deleted{" "}
                          {new Date(task.trashedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => restoreTask(task._id, task.title)}
                    disabled={restoringId === task._id}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {restoringId === task._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Restore Task</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-500/10 text-(--color-desc) flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-(--color-text)">Trash is empty</h3>
            <p className="text-xs text-(--color-desc) mt-1 max-w-sm">
              Any tasks you delete from My Tasks or Calendar will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
