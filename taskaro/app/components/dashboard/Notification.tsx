"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { timeAgo } from "@/utils/timeAgo";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Zap,
  Ticket,
  Flame,
  CheckCheck,
  ArrowRight,
  Filter,
  Sparkles,
  Inbox,
  RefreshCw,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export default function Notification() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "tasks" | "queries" | "standup">("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/secure/notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notification || []);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to load notifications." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error loading notifications." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      const res = await fetch("/api/secure/notifications/read-all", {
        method: "PATCH",
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setFeedback({ type: "success", message: "All notifications marked as read." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to mark all as read." });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/secure/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif._id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "tasks":
        return notifications.filter((n) =>
          ["TASK_ASSIGNED", "TASK_OVERDUE", "TASK_DONE", "TASK_BLOCKED", "TASK_UNBLOCKED"].includes(
            n.type || ""
          )
        );
      case "queries":
        return notifications.filter((n) =>
          ["TICKET_RAISED", "TICKET_ASSIGNED", "TICKET_RESOLVED", "SLA_BREACHED"].includes(
            n.type || ""
          )
        );
      case "standup":
        return notifications.filter((n) =>
          ["STANDUP_NUDGE", "TEAM_INVITE", "LEAD_APPOINTED"].includes(n.type || "")
        );
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const renderBadge = (notif: NotificationItem) => {
    switch (notif.type) {
      case "TASK_ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
            <Zap className="w-3 h-3" /> Task Assigned
          </span>
        );
      case "TASK_OVERDUE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> Overdue
          </span>
        );
      case "TASK_DONE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "TASK_BLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/20">
            <ShieldAlert className="w-3 h-3" /> Blocked
          </span>
        );
      case "TASK_UNBLOCKED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <Sparkles className="w-3 h-3" /> Unblocked
          </span>
        );
      case "TICKET_RAISED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-500 border border-purple-500/20">
            <Ticket className="w-3 h-3" /> New Query
          </span>
        );
      case "TICKET_ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-500 border border-blue-500/20">
            <Zap className="w-3 h-3" /> Scheduled
          </span>
        );
      case "TICKET_RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Query Resolved
          </span>
        );
      case "SLA_BREACHED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse">
            <AlertTriangle className="w-3 h-3" /> SLA Breached
          </span>
        );
      case "STANDUP_NUDGE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20">
            <Flame className="w-3 h-3" /> Standup Pulse
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/15 text-(--color-desc)">
            <Bell className="w-3 h-3" /> Update
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto py-2">
      {/* INLINE STATUS BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-(--color-text)">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-xs">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs text-(--color-desc) mt-0.5">
            Real-time pulse updates for task assignments, deadline overdues, blockers, and SLA alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="p-2 rounded-xl bg-(--card-bg) border border-(--color-border) text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition-colors cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="px-3.5 py-2 rounded-xl bg-(--card-bg) border border-(--color-border) hover:bg-(--hover-card-bg) text-xs font-bold text-(--color-text) flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-500" />
              <span>{markingAll ? "Marking..." : "Mark all as read"}</span>
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: "All Updates", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          {
            key: "tasks",
            label: "Tasks & Blockers",
            count: notifications.filter((n) =>
              ["TASK_ASSIGNED", "TASK_OVERDUE", "TASK_DONE", "TASK_BLOCKED", "TASK_UNBLOCKED"].includes(
                n.type || ""
              )
            ).length,
          },
          {
            key: "queries",
            label: "Queries & SLA",
            count: notifications.filter((n) =>
              ["TICKET_RAISED", "TICKET_ASSIGNED", "TICKET_RESOLVED", "SLA_BREACHED"].includes(
                n.type || ""
              )
            ).length,
          },
          {
            key: "standup",
            label: "Standup & Team",
            count: notifications.filter((n) =>
              ["STANDUP_NUDGE", "TEAM_INVITE", "LEAD_APPOINTED"].includes(n.type || "")
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "bg-(--color-primary) text-white shadow-xs"
                : "bg-(--card-bg) border border-(--color-border) text-(--color-desc) hover:text-(--color-text)"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-(--hover-card-bg) text-(--color-desc)"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* NOTIFICATION FEED */}
      <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-(--color-primary) animate-spin" />
            <p className="text-xs text-(--color-desc) font-medium">Scanning notification stream...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Inbox className="w-10 h-10 text-(--color-desc) mx-auto opacity-50" />
            <p className="text-sm font-bold text-(--color-text)">No notifications found</p>
            <p className="text-xs text-(--color-desc)">
              {activeTab === "unread"
                ? "You have caught up with all updates!"
                : "Activity updates will show up here in real time."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-(--color-border)/50">
            {filteredNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                  notif.isRead
                    ? "hover:bg-(--hover-card-bg)/60 opacity-80"
                    : "bg-blue-500/5 hover:bg-blue-500/10 opacity-100"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* UNREAD STATUS DOT */}
                  <div className="pt-1.5 shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        notif.isRead ? "bg-transparent" : "bg-blue-500 shadow-xs"
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {renderBadge(notif)}
                      <p className="text-xs font-bold text-(--color-text)">{notif.title}</p>
                    </div>

                    <p className="text-xs text-(--color-desc) leading-relaxed">
                      {notif.message}
                    </p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-[10px] text-(--color-desc) font-mono">
                        {timeAgo(notif.createdAt)}
                      </span>

                      {notif.link && (
                        <span className="text-[11px] font-bold text-(--color-primary) hover:underline flex items-center gap-1">
                          <span>Open</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
