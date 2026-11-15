"use client";

import React, { useEffect, useState } from "react";
import { protectedApiPost } from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
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
    date: dateFromCalendar || new Date().toISOString().split("T")[0],
    time: "10:00",
    assignTo: "self",
  });

  useEffect(() => {
    if (dateFromCalendar) {
      setForm((prev) => ({ ...prev, date: dateFromCalendar }));
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

      // Combine date and time
      const [year, month, day] = form.date.split("-").map(Number);
      const [hours, minutes] = (form.time || "10:00").split(":").map(Number);
      const dueDate = new Date(year, month - 1, day, hours, minutes, 0).toISOString();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate,
        assignTo: "self",
      };

      await protectedApiPost("/secure/tasks/create", payload);
      setSuccessMessage("Task created and scheduled successfully!");

      // Reset title and description
      setForm((prev) => ({
        ...prev,
        title: "",
        description: "",
      }));

      // After 1.5 seconds, navigate to My Tasks or Calendar
      setTimeout(() => {
        if (dateFromCalendar) {
          router.push("/dashboard/calendar");
        } else {
          router.push("/dashboard/my-tasks");
        }
      }, 1200);
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
    <div className="max-w-3xl mx-auto space-y-6">
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
          <span>{successMessage} Redirecting to your schedule...</span>
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
        className="bg-(--card-bg) border border-(--color-border) rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors"
      >
        {/* Title */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Design quarterly roadmap, Refactor auth routes..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) text-sm outline-none focus:border-(--color-primary) transition-colors placeholder:text-(--color-desc)"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2">
            Description
          </label>
          <textarea
            rows={4}
            placeholder="Provide context, acceptance criteria, sub-items, or useful links..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) text-sm outline-none focus:border-(--color-primary) transition-colors placeholder:text-(--color-desc) resize-none"
          />
        </div>

        {/* Priority & Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Priority */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`py-2.5 px-3 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                    form.priority === p
                      ? p === "high"
                        ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 font-bold shadow-xs"
                        : p === "medium"
                        ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                        : "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "border-(--color-border) text-(--color-desc) hover:bg-(--hover-card-bg)"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Assigned To */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2">
              Assigned To
            </label>
            <select
              value={form.assignTo}
              onChange={(e) => setForm({ ...form, assignTo: e.target.value })}
              className="w-full py-2.5 px-3.5 rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) text-xs sm:text-sm outline-none focus:border-(--color-primary) cursor-pointer"
            >
              <option value="self">Myself (Self)</option>
            </select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Due Date</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) text-xs sm:text-sm outline-none focus:border-(--color-primary)"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-(--color-text) mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Due Time</span>
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-(--color-border) bg-(--color-input) text-(--color-text) text-xs sm:text-sm outline-none focus:border-(--color-primary)"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-(--color-border) flex items-center justify-end gap-3">
          <Link
            href="/dashboard/my-tasks"
            className="px-5 py-2.5 rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Task...</span>
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
