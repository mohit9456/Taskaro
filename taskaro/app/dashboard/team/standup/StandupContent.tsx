"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  ShieldAlert,
  Send,
  Calendar,
  Users2,
  RefreshCw,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface PulseRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  date: string;
  focusTasks: string[];
  blockers?: string;
  hasBlocker: boolean;
  estimatedHours: number;
  energyScore: number;
  submittedAt: string;
}

export default function StandupContent() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Department Pulses Data
  const [deptPulses, setDeptPulses] = useState<PulseRecord[]>([]);
  const [deptStats, setDeptStats] = useState({
    totalSubmissions: 0,
    totalEstimatedHours: 0,
    activeBlockers: 0,
    avgEnergy: 5,
  });

  // Current User Submission Form
  const [focusInput, setFocusInput] = useState("");
  const [focusTasks, setFocusTasks] = useState<string[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<any[]>([]);
  const [hasBlocker, setHasBlocker] = useState(false);
  const [blockersText, setBlockersText] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(8);
  const [energyScore, setEnergyScore] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Initial Load
  const init = async () => {
    try {
      setLoading(true);
      const orgRes = await fetch("/api/secure/team/org");
      const orgData = await orgRes.json();

      if (orgRes.ok && orgData.organizations?.length > 0) {
        const currentOrgId = orgData.organizations[0].org._id;
        setOrgId(currentOrgId);

        const detailsRes = await fetch(`/api/secure/team/org/${currentOrgId}`);
        const detailsData = await detailsRes.json();

        if (detailsRes.ok && detailsData.departments?.length > 0) {
          setDepartments(detailsData.departments);
          const firstDeptId = detailsData.departments[0]._id;
          setSelectedDeptId(firstDeptId);
          await fetchDepartmentPulses(currentOrgId, firstDeptId, selectedDate);
        }

        // Fetch user assigned active tasks
        const tasksRes = await fetch(`/api/secure/team/tasks?orgId=${currentOrgId}`);
        const tasksData = await tasksRes.json();
        if (tasksRes.ok && tasksData.tasks) {
          const myTasks = tasksData.tasks.filter(
            (t: any) =>
              t.assignedTo?._id === (session?.user as any)?.id && t.status !== "done"
          );
          setMyAssignedTasks(myTasks);
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to initialize standup engine." });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentPulses = async (activeOrgId: string, deptId: string, date: string) => {
    try {
      const url = new URL("/api/secure/team/standup", window.location.origin);
      url.searchParams.set("orgId", activeOrgId);
      url.searchParams.set("departmentId", deptId);
      url.searchParams.set("date", date);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setDeptPulses(data.pulses || []);
        if (data.stats) setDeptStats(data.stats);

        // Populate user's own pulse if already submitted
        const myPulse = data.pulses?.find(
          (p: any) => p.userId?._id === (session?.user as any)?.id
        );
        if (myPulse) {
          setFocusTasks(myPulse.focusTasks || []);
          setHasBlocker(myPulse.hasBlocker);
          setBlockersText(myPulse.blockers || "");
          setEstimatedHours(myPulse.estimatedHours || 8);
          setEnergyScore(myPulse.energyScore || 5);
        }
      }
    } catch {
      console.error("Error fetching department pulses.");
    }
  };

  useEffect(() => {
    init();
  }, []);

  const handleAddFocusTask = () => {
    if (!focusInput.trim()) return;
    if (focusTasks.length >= 5) {
      setFeedback({ type: "error", message: "Maximum 5 primary focus tasks per day recommended." });
      return;
    }
    setFocusTasks([...focusTasks, focusInput.trim()]);
    setFocusInput("");
  };

  const handleRemoveFocusTask = (index: number) => {
    setFocusTasks(focusTasks.filter((_, i) => i !== index));
  };

  const handleSubmitPulse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedDeptId) return;

    if (focusTasks.length === 0 && !focusInput.trim()) {
      setFeedback({ type: "error", message: "Please specify at least 1 focus task for today." });
      return;
    }

    const finalFocus = focusTasks.length > 0 ? focusTasks : [focusInput.trim()];

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          departmentId: selectedDeptId,
          focusTasks: finalFocus,
          blockers: blockersText,
          hasBlocker: hasBlocker || blockersText.trim().length > 0,
          estimatedHours,
          energyScore,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "60-Second Morning Pulse recorded! Your Lead and team are now aligned.",
        });
        await fetchDepartmentPulses(orgId, selectedDeptId, selectedDate);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to submit pulse." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error submitting pulse." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-(--color-primary) animate-spin" />
        <p className="text-sm font-medium text-(--color-desc)">Syncing 60-second standup matrix...</p>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Activity className="w-12 h-12 text-(--color-desc) mx-auto" />
        <h2 className="text-lg font-bold text-(--color-text)">No Organization Hub Found</h2>
        <p className="text-xs text-(--color-desc)">
          Initialize an organization first to participate in async daily standups.
        </p>
        <Link
          href="/dashboard/team"
          className="inline-flex px-4 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-bold"
        >
          Setup Organization
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

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-(--color-text)">60-Second Async Daily Standup</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              ZERO-MEETING PULSE
            </span>
          </div>
          <p className="text-xs text-(--color-desc) mt-0.5">
            Eliminate 30-minute morning calls. Log daily focus, flag blockers, and calibrate team readiness in 60 seconds.
          </p>
        </div>
      </div>

      {/* EXPLANATORY HOW-IT-WORKS HERO */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/25 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-extrabold text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 1. No Boring 30-min Calls
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Eliminate scheduled meeting fatigue. Share your 3 daily focus areas in 60 seconds whenever your day starts.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> 2. Instant Blocker Alert
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Waiting on Design or Backend? Flag it here to light up an alert on your Lead's radar immediately.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 3. Async Alignment
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Leads and founders review the department radar in 2 minutes, unblocking team members with zero interruptions.
          </p>
        </div>
      </div>

      {/* SECTION 1: MY DAILY PULSE FORM */}
      <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-(--color-text)">Log Your Morning Pulse</h2>
          </div>
          <span className="text-xs font-mono font-bold text-(--color-desc) bg-(--hover-card-bg) px-3 py-1 rounded-xl border border-(--color-border)">
            Date: {selectedDate}
          </span>
        </div>

        <form onSubmit={handleSubmitPulse} className="space-y-4">
          {/* FOCUS TASKS */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="block text-xs font-bold text-(--color-text)">
                1. What are your 1-3 primary focus tasks today?
              </label>
              {myAssignedTasks.length > 0 && (
                <span className="text-[11px] text-(--color-desc)">
                  Click any assigned task below to quick-import:
                </span>
              )}
            </div>

            {/* 1-CLICK IMPORT OF ASSIGNED TASKS */}
            {myAssignedTasks.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                {myAssignedTasks.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => {
                      if (!focusTasks.includes(t.title) && focusTasks.length < 5) {
                        setFocusTasks([...focusTasks, t.title]);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-(--hover-card-bg) hover:bg-indigo-600 hover:text-white border border-(--color-border) text-(--color-text) transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{t.title}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Implement OAuth JWT callback, Review PR #42"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFocusTask();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddFocusTask}
                className="px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) hover:bg-(--color-border) border border-(--color-border) text-xs font-bold text-(--color-text) transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* FOCUS CHIPS */}
            {focusTasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2.5">
                {focusTasks.map((task, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold"
                  >
                    <span>{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFocusTask(idx)}
                      className="hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* BLOCKER TOGGLE & TEXT */}
          <div className="p-4 rounded-2xl bg-(--hover-card-bg)/50 border border-(--color-border) space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-(--color-text)">
                  2. Do you have any cross-department blockers or waiting dependencies?
                </p>
                <p className="text-[11px] text-(--color-desc)">
                  Flagging an active blocker will instantly highlight your card on your Lead's board.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setHasBlocker(!hasBlocker)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  hasBlocker
                    ? "bg-rose-500 text-white shadow-xs"
                    : "bg-(--card-bg) border border-(--color-border) text-(--color-desc)"
                }`}
              >
                {hasBlocker ? "⚠️ Blocked" : "No Blockers"}
              </button>
            </div>

            {hasBlocker && (
              <textarea
                rows={2}
                placeholder="Explain what is blocking you (e.g. Waiting on API response from Backend team, Missing Figma design assets)..."
                value={blockersText}
                onChange={(e) => setBlockersText(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-(--card-bg) border border-rose-500/40 text-xs text-(--color-text) focus:outline-hidden"
              />
            )}
          </div>

          {/* HOURS & ENERGY SCORE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                3. Estimated Focus Hours Today
              </label>
              <div className="flex items-center gap-2">
                {[4, 6, 8, 10].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setEstimatedHours(h)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      estimatedHours === h
                        ? "bg-(--color-primary) text-white shadow-xs"
                        : "bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)"
                    }`}
                  >
                    {h} hrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                4. Energy & Readiness Score (1 to 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setEnergyScore(score)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      energyScore === score
                        ? "bg-amber-500 text-black shadow-xs"
                        : "bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)"
                    }`}
                  >
                    ⚡ {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-(--color-primary) hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              {submitting ? "Logging Pulse..." : "Log Today's Morning Pulse"}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: DEPARTMENT READINESS DASHBOARD */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-(--color-text) flex items-center gap-2">
              <Users2 className="w-5 h-5 text-indigo-500" />
              <span>Department Readiness Radar</span>
            </h2>
            <p className="text-xs text-(--color-desc)">
              Real-time alignment view for Department Leads and Founders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDeptId}
              onChange={(e) => {
                setSelectedDeptId(e.target.value);
                if (orgId) fetchDepartmentPulses(orgId, e.target.value, selectedDate);
              }}
              className="px-3 py-1.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-xs font-bold text-(--color-text) focus:outline-hidden"
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (orgId && selectedDeptId) fetchDepartmentPulses(orgId, selectedDeptId, e.target.value);
              }}
              className="px-3 py-1.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-xs font-bold text-(--color-text) focus:outline-hidden"
            />
          </div>
        </div>

        {/* AGGREGATE KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">Pulses Logged</p>
            <p className="text-xl font-black text-(--color-text) mt-1">{deptStats.totalSubmissions} Members</p>
          </div>
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Total Committed Bandwidth</p>
            <p className="text-xl font-black text-(--color-text) mt-1">{deptStats.totalEstimatedHours} Hours</p>
          </div>
          <div
            className={`p-4 rounded-2xl border shadow-xs ${
              deptStats.activeBlockers > 0
                ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
                : "bg-(--card-bg) border-(--color-border)"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider">Active Bottlenecks</p>
            <p className="text-xl font-black mt-1 text-(--color-text)">{deptStats.activeBlockers}</p>
          </div>
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Average Readiness</p>
            <p className="text-xl font-black text-(--color-text) mt-1">⚡ {deptStats.avgEnergy} / 5</p>
          </div>
        </div>

        {/* TEAM MEMBER PULSES LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deptPulses.length === 0 ? (
            <div className="col-span-2 p-10 text-center rounded-3xl bg-(--card-bg) border border-(--color-border) text-xs text-(--color-desc)">
              No pulses submitted for this department on {selectedDate}.
            </div>
          ) : (
            deptPulses.map((pulse) => (
              <div
                key={pulse._id}
                className={`p-5 rounded-3xl bg-(--card-bg) border shadow-xs space-y-3 ${
                  pulse.hasBlocker ? "border-rose-500/40 bg-rose-500/5" : "border-(--color-border)"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {pulse.userId?.name ? pulse.userId.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-(--color-text)">{pulse.userId?.name}</p>
                      <p className="text-[10px] text-(--color-desc)">{pulse.userId?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-(--hover-card-bg) text-(--color-text)">
                      ⏱️ {pulse.estimatedHours}h
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">
                      ⚡ {pulse.energyScore}/5
                    </span>
                  </div>
                </div>

                {/* FOCUS TASKS */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
                    Today's Focus:
                  </p>
                  <ul className="list-disc list-inside text-xs text-(--color-text) space-y-0.5">
                    {pulse.focusTasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* BLOCKER IF ANY */}
                {pulse.hasBlocker && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> Active Blocker:
                    </p>
                    <p className="text-[11px] text-(--color-text)">{pulse.blockers}</p>
                    <div className="pt-1 flex items-center gap-2">
                      <Link
                        href={`/dashboard/team/tickets`}
                        className="text-[10px] font-bold underline hover:opacity-80"
                      >
                        Raise Urgent Blocker Ticket $\rightarrow$
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
