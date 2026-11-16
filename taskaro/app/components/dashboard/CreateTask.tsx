"use client";

import React, { useEffect, useState } from "react";
import { protectedApiPost } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function CreateTask() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFromCalendar = searchParams?.get("date"); // yyyy-mm-dd

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: dateFromCalendar || new Date().toISOString().split("T")[0],
    assignTo: "self",
  });

  useEffect(() => {
    if (dateFromCalendar) {
      setForm((prev) => ({ ...prev, dueDate: dateFromCalendar }));
    }
  }, [dateFromCalendar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.title.trim()) {
      setErrorMessage("Please enter a task title.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : new Date().toISOString(),
        assignTo: "self",
      };

      await protectedApiPost("/secure/tasks/create", payload);
      setSuccessMessage("Task created successfully!");

      // Reset title and description
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
      }));

      // Redirect
      setTimeout(() => {
        if (dateFromCalendar) {
          router.push("/dashboard/calendar");
        } else {
          router.push("/dashboard/my-tasks");
        }
      }, 1000);
    } catch (err: any) {
      console.error("Create task error:", err);
      setErrorMessage(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to create task. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/my-tasks"
            className="p-2 rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-(--color-text)">
              Create New Task
            </h1>
            <p className="text-xs sm:text-sm text-(--color-desc)">
              Define your task, assign priority, and set deadlines.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/calendar"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">View Calendar</span>
        </Link>
      </div>

      {/* Inline Feedback Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMessage} Redirecting...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Task Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors"
      >
        {/* Title */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-(--color-text)">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. Design quarterly roadmap, Review sprint backlog..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-(--color-text)">
            Description & Details
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, acceptance criteria, sub-items, or useful links..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-(--color-primary)/30 transition-all resize-none"
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Priority */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-(--color-text)">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-(--hover-card-bg) p-1 border border-(--color-border)">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    form.priority === p
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

          {/* Target Due Date */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-(--color-text)">
              Target Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-primary)/30"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-(--color-border) flex items-center justify-end gap-3">
          <Link
            href="/dashboard/my-tasks"
            className="px-4 py-2 rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
