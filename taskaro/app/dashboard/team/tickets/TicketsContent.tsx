"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Ticket,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Send,
  UserCheck,
} from "lucide-react";

interface TicketData {
  _id: string;
  ticketCode: string;
  title: string;
  description: string;
  type: "query" | "blocker" | "asset_request" | "bug_report" | "review_request";
  priority: "low" | "medium" | "high" | "urgent_blocker";
  status: "open" | "in_progress" | "resolved" | "escalated" | "closed";
  sourceDeptId: {
    _id: string;
    name: string;
    code: string;
    color: string;
  };
  targetDeptId: {
    _id: string;
    name: string;
    code: string;
    color: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  assignedLeadId?: {
    _id: string;
    name: string;
    email: string;
  };
  assignedMemberId?: {
    _id: string;
    name: string;
    email: string;
  };
  slaDeadline?: string;
  isEscalated: boolean;
  isOverdue?: boolean;
  slaRemainingHours?: number | null;
  resolutionSummary?: string;
  createdAt: string;
}

export default function TicketsContent() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [targetDeptFilter, setTargetDeptFilter] = useState("all");

  // Inline zero-toast feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [resolveModalTicket, setResolveModalTicket] = useState<TicketData | null>(null);
  const [resolutionText, setResolutionText] = useState("");

  // Raise Form
  const [raiseForm, setRaiseForm] = useState({
    title: "",
    description: "",
    type: "query" as "query" | "blocker" | "asset_request" | "bug_report" | "review_request",
    priority: "medium" as "low" | "medium" | "high" | "urgent_blocker",
    sourceDeptId: "",
    targetDeptId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // 1. Initial Load: Find User Org
  const init = async () => {
    try {
      setLoading(true);
      const orgRes = await fetch("/api/secure/team/org");
      const orgData = await orgRes.json();

      if (orgRes.ok && orgData.organizations?.length > 0) {
        const currentOrgId = orgData.organizations[0].org._id;
        setOrgId(currentOrgId);

        // Fetch details to get departments
        const detailsRes = await fetch(`/api/secure/team/org/${currentOrgId}`);
        const detailsData = await detailsRes.json();
        if (detailsRes.ok && detailsData.departments) {
          setDepartments(detailsData.departments);
          if (detailsData.departments.length >= 2) {
            setRaiseForm((prev) => ({
              ...prev,
              sourceDeptId: detailsData.departments[0]._id,
              targetDeptId: detailsData.departments[1]._id,
            }));
          }
        }

        await fetchTickets(currentOrgId);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to initialize query desk." });
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async (activeOrgId: string) => {
    try {
      const url = new URL("/api/secure/team/tickets", window.location.origin);
      url.searchParams.set("orgId", activeOrgId);
      if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
      if (priorityFilter !== "all") url.searchParams.set("priority", priorityFilter);
      if (targetDeptFilter !== "all") url.searchParams.set("targetDeptId", targetDeptFilter);
      if (search.trim()) url.searchParams.set("search", search.trim());

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to load tickets." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error loading tickets." });
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (orgId) {
      fetchTickets(orgId);
    }
  }, [statusFilter, priorityFilter, targetDeptFilter, search]);

  // Raise Query / Blocker
  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !raiseForm.title.trim()) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...raiseForm,
          orgId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: data.message || "Query ticket dispatched to Department Lead!",
        });
        setShowRaiseModal(false);
        setRaiseForm((prev) => ({ ...prev, title: "", description: "" }));
        await fetchTickets(orgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to raise query." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error raising query." });
    } finally {
      setSubmitting(false);
    }
  };

  // Change Status / Resolve
  const handleUpdateStatus = async (ticketId: string, newStatus: string, summary?: string) => {
    try {
      setFeedback(null);
      const res = await fetch("/api/secure/team/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          status: newStatus,
          resolutionSummary: summary,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: `Ticket status updated to '${newStatus}'.` });
        if (orgId) await fetchTickets(orgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update ticket." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating ticket." });
    }
  };

  // Handle Submit Resolution
  const handleConfirmResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalTicket) return;
    await handleUpdateStatus(resolveModalTicket._id, "resolved", resolutionText);
    setResolveModalTicket(null);
    setResolutionText("");
  };

  // Stats
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
  const escalatedCount = tickets.filter((t) => t.isEscalated && t.status !== "resolved").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-(--color-primary) animate-spin" />
        <p className="text-sm font-medium text-(--color-desc)">Syncing query desk & SLA timers...</p>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Ticket className="w-12 h-12 text-(--color-desc) mx-auto" />
        <h2 className="text-lg font-bold text-(--color-text)">No Organization Hub Found</h2>
        <p className="text-xs text-(--color-desc)">
          You must create or join an organization to access cross-department tickets.
        </p>
        <Link
          href="/dashboard/team"
          className="inline-flex px-4 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-bold"
        >
          Go to Team Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* INLINE STATUS BANNER */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* HEADER STRIP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-(--color-text)">Cross-Department Query Desk</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              SLA ENGINE
            </span>
          </div>
          <p className="text-xs text-(--color-desc) mt-0.5">
            Resolve blocker questions, review requests, and asset dependencies with automated SLA escalation.
          </p>
        </div>

        <button
          onClick={() => setShowRaiseModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-(--color-primary) hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Query / Blocker</span>
        </button>
      </div>

      {/* STATS METRIC TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">All Queries</p>
          <p className="text-2xl font-black text-(--color-text) mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Open</p>
          <p className="text-2xl font-black text-(--color-text) mt-1">{openCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">In Progress</p>
          <p className="text-2xl font-black text-(--color-text) mt-1">{inProgressCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Resolved</p>
          <p className="text-2xl font-black text-(--color-text) mt-1">{resolvedCount}</p>
        </div>
        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            escalatedCount > 0
              ? "bg-rose-500/10 border-rose-500/40 text-rose-500 animate-pulse"
              : "bg-(--card-bg) border-(--color-border)"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Blocker Pulse</p>
          </div>
          <p className="text-2xl font-black mt-1 text-(--color-text)">{escalatedCount}</p>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-(--color-desc) shrink-0" />
          <input
            type="text"
            placeholder="Search tickets, codes (e.g. ENG-001), or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-(--color-text) focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) focus:outline-hidden font-medium"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) focus:outline-hidden font-medium"
          >
            <option value="all">Priority: All</option>
            <option value="urgent_blocker">Urgent Blocker</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={targetDeptFilter}
            onChange={(e) => setTargetDeptFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) focus:outline-hidden font-medium"
          >
            <option value="all">Target Dept: All</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TICKET LIST */}
      <div className="space-y-3.5">
        {tickets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-(--card-bg) border border-(--color-border) space-y-3">
            <Ticket className="w-10 h-10 text-(--color-desc) mx-auto opacity-50" />
            <h3 className="text-sm font-bold text-(--color-text)">No queries found</h3>
            <p className="text-xs text-(--color-desc)">
              There are currently no tickets matching your search filters.
            </p>
          </div>
        ) : (
          tickets.map((t) => {
            const isBlocker = t.priority === "urgent_blocker" || t.isEscalated;

            return (
              <div
                key={t._id}
                className={`p-4 sm:p-5 rounded-3xl bg-(--card-bg) border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isBlocker && t.status !== "resolved"
                    ? "border-rose-500/50 bg-rose-500/5 hover:border-rose-500"
                    : "border-(--color-border) hover:border-(--color-primary)/50"
                }`}
              >
                {/* TICKET INFO */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-(--hover-card-bg) border border-(--color-border) text-(--color-text)">
                      {t.ticketCode}
                    </span>

                    {/* PRIORITY BADGE */}
                    {t.priority === "urgent_blocker" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> URGENT BLOCKER
                      </span>
                    ) : t.priority === "high" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500">
                        HIGH
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/15 text-(--color-desc)">
                        {t.priority.toUpperCase()}
                      </span>
                    )}

                    {/* STATUS BADGE */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === "resolved"
                          ? "bg-emerald-500/15 text-emerald-500"
                          : t.status === "in_progress"
                          ? "bg-blue-500/15 text-blue-500"
                          : t.status === "escalated"
                          ? "bg-rose-500/15 text-rose-500"
                          : "bg-amber-500/15 text-amber-500"
                      }`}
                    >
                      {t.status.toUpperCase()}
                    </span>

                    {/* DEPARTMENTS ROUTE */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-(--color-desc)">
                      <span className="text-(--color-text)">{t.sourceDeptId?.name}</span>
                      <ArrowRight className="w-3 h-3 text-(--color-desc)" />
                      <span
                        className="font-bold"
                        style={{ color: t.targetDeptId?.color || "#6366f1" }}
                      >
                        {t.targetDeptId?.name}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-(--color-text) hover:underline cursor-pointer">
                    {t.title}
                  </h3>

                  {t.description && (
                    <p className="text-xs text-(--color-desc) line-clamp-2 max-w-3xl">
                      {t.description}
                    </p>
                  )}

                  {t.resolutionSummary && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 space-y-0.5">
                      <span className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Note:
                      </span>
                      <p className="text-[11px] text-(--color-text)">{t.resolutionSummary}</p>
                    </div>
                  )}

                  {/* META STRIP */}
                  <div className="flex items-center gap-4 text-[11px] text-(--color-desc) pt-1 flex-wrap">
                    <span>Raised by <b className="text-(--color-text)">{t.createdBy?.name}</b></span>
                    {t.assignedLeadId && (
                      <span>Lead: <b className="text-(--color-text)">{t.assignedLeadId?.name}</b></span>
                    )}

                    {/* SLA COUNTDOWN BADGE */}
                    {t.status !== "resolved" && (
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          t.isOverdue || t.isEscalated
                            ? "text-rose-500 animate-pulse"
                            : "text-amber-500"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {t.isOverdue
                          ? "SLA BREACHED (Lead Escalated)"
                          : `${t.slaRemainingHours ?? "—"}h SLA Remaining`}
                      </span>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Link
                    href={`/dashboard/team/chat?channelType=ticket&ticketId=${t._id}`}
                    className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Huddle Chat</span>
                  </Link>

                  {t.status !== "resolved" && (
                    <button
                      onClick={() => {
                        setResolveModalTicket(t);
                        setResolutionText("");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {t.status === "open" && (
                    <button
                      onClick={() => handleUpdateStatus(t._id, "in_progress")}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Take On
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: RAISE QUERY / BLOCKER */}
      {showRaiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-(--color-text)">Dispatch Query / Blocker Ticket</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                CROSS-DEPT
              </span>
            </div>

            <form onSubmit={handleRaiseTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Title / Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need OAuth callback redirect URL updated, Missing SVG icons"
                  value={raiseForm.title}
                  onChange={(e) => setRaiseForm({ ...raiseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Source Department</label>
                  <select
                    value={raiseForm.sourceDeptId}
                    onChange={(e) => setRaiseForm({ ...raiseForm, sourceDeptId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Target Department *</label>
                  <select
                    value={raiseForm.targetDeptId}
                    onChange={(e) => setRaiseForm({ ...raiseForm, targetDeptId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.defaultSlaHours}h SLA)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Priority</label>
                  <select
                    value={raiseForm.priority}
                    onChange={(e) => setRaiseForm({ ...raiseForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    <option value="low">Low (48h SLA)</option>
                    <option value="medium">Medium (24h SLA)</option>
                    <option value="high">High (12h SLA)</option>
                    <option value="urgent_blocker">🚨 Urgent Blocker (4h SLA + Auto Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Category</label>
                  <select
                    value={raiseForm.type}
                    onChange={(e) => setRaiseForm({ ...raiseForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    <option value="query">General Query</option>
                    <option value="blocker">Critical Blocker</option>
                    <option value="asset_request">Asset Request</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="review_request">Review Request</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Description / Details</label>
                <textarea
                  rows={3}
                  placeholder="Provide context, reproduction steps, or link to relevant task..."
                  value={raiseForm.description}
                  onChange={(e) => setRaiseForm({ ...raiseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRaiseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--color-primary) text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Dispatching..." : "Dispatch Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLUTION NOTE */}
      {resolveModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">
              Mark {resolveModalTicket.ticketCode} as Resolved
            </h3>
            <p className="text-xs text-(--color-desc)">
              Add a concise resolution note so other team members know how this blocker was solved.
            </p>

            <form onSubmit={handleConfirmResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                  Resolution Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Updated OAuth credentials in prod env and verified login flow."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
