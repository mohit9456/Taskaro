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
  Share2,
  BellRing,
  ArrowRight,
  Smile,
  Flame,
  Check,
  Building2,
} from "lucide-react";

interface PulseRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role?: string;
    profileImage?: string;
  };
  date: string;
  yesterdayTasks?: string[];
  focusTasks: string[];
  blockers?: string;
  hasBlocker: boolean;
  blockedByDepartmentId?: {
    _id: string;
    name: string;
    color?: string;
  } | null;
  estimatedHours: number;
  energyScore: number;
  submittedAt: string;
}

interface MissingMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  jobTitle?: string;
  profileImage?: string;
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
  const [missingMembers, setMissingMembers] = useState<MissingMember[]>([]);
  const [deptStats, setDeptStats] = useState({
    totalSubmissions: 0,
    totalDepartmentMembers: 0,
    submissionRate: 100,
    totalEstimatedHours: 0,
    activeBlockers: 0,
    avgEnergy: 5,
  });

  // Current User Submission Form
  const [yesterdayInput, setYesterdayInput] = useState("");
  const [yesterdayTasks, setYesterdayTasks] = useState<string[]>([]);
  const [autoCompletedTasks, setAutoCompletedTasks] = useState<string[]>([]);

  const [focusInput, setFocusInput] = useState("");
  const [focusTasks, setFocusTasks] = useState<string[]>([]);
  const [myAssignedTasks, setMyAssignedTasks] = useState<any[]>([]);

  const [hasBlocker, setHasBlocker] = useState(false);
  const [blockersText, setBlockersText] = useState("");
  const [blockedByDeptId, setBlockedByDeptId] = useState("");

  const [estimatedHours, setEstimatedHours] = useState(8);
  const [energyScore, setEnergyScore] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [nudgingUserId, setNudgingUserId] = useState<string | null>(null);
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
        setMissingMembers(data.missingMembers || []);
        if (data.stats) setDeptStats(data.stats);
        if (data.completedYesterdayTasks) {
          setAutoCompletedTasks(data.completedYesterdayTasks);
        }

        // Populate user's own pulse if already submitted
        const myPulse = data.pulses?.find(
          (p: any) => p.userId?._id === (session?.user as any)?.id
        );
        if (myPulse) {
          setYesterdayTasks(myPulse.yesterdayTasks || []);
          setFocusTasks(myPulse.focusTasks || []);
          setHasBlocker(myPulse.hasBlocker);
          setBlockersText(myPulse.blockers || "");
          setBlockedByDeptId(myPulse.blockedByDepartmentId?._id || "");
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

  const handleAddYesterdayTask = () => {
    if (!yesterdayInput.trim()) return;
    if (yesterdayTasks.length >= 5) {
      setFeedback({ type: "error", message: "Maximum 5 accomplishments recommended for brevity." });
      return;
    }
    setYesterdayTasks([...yesterdayTasks, yesterdayInput.trim()]);
    setYesterdayInput("");
  };

  const handleRemoveYesterdayTask = (index: number) => {
    setYesterdayTasks(yesterdayTasks.filter((_, i) => i !== index));
  };

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
    const finalYesterday = yesterdayTasks.length > 0 ? yesterdayTasks : (yesterdayInput.trim() ? [yesterdayInput.trim()] : []);

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          departmentId: selectedDeptId,
          yesterdayTasks: finalYesterday,
          focusTasks: finalFocus,
          blockers: blockersText,
          hasBlocker: hasBlocker || blockersText.trim().length > 0 || Boolean(blockedByDeptId),
          blockedByDepartmentId: blockedByDeptId || null,
          estimatedHours,
          energyScore,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "🚀 60-Second Morning Pulse recorded! Your Lead and team are now 100% aligned.",
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

  // 1-Click Broadcast Standup Digest to Department Chat
  const handleBroadcastDigest = async () => {
    if (!orgId || !selectedDeptId) return;
    try {
      setBroadcasting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          departmentId: selectedDeptId,
          date: selectedDate,
          action: "broadcast",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: "📢 Morning Standup Digest successfully broadcasted to department chat channel!",
        });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to broadcast digest." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to broadcast standup digest." });
    } finally {
      setBroadcasting(false);
    }
  };

  // 1-Click Nudge Missing Member via Direct Chat
  const handleNudgeMember = async (targetUserId: string, memberName: string) => {
    if (!orgId) return;
    try {
      setNudgingUserId(targetUserId);
      const res = await fetch("/api/secure/team/standup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          targetUserId,
          action: "nudge",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: "success",
          message: `⚡ Gentle reminder sent to ${memberName} via direct chat!`,
        });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to send nudge." });
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to nudge member." });
    } finally {
      setNudgingUserId(null);
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
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* HEADER & QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-(--color-text)">60-Second Async Daily Standup</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30">
              ZERO-MEETING PULSE
            </span>
          </div>
          <p className="text-xs text-(--color-desc) mt-0.5">
            Say goodbye to 30-minute daily morning video calls. Log yesterday&apos;s wins, today&apos;s focus, and blockers in 60 seconds.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/team/chat"
            className="px-3 py-2 rounded-xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-xs font-bold text-(--color-text) flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Open Team Chat</span>
          </Link>

          <button
            type="button"
            onClick={handleBroadcastDigest}
            disabled={broadcasting || deptPulses.length === 0}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Post today's morning standup summary into this department's chat room"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{broadcasting ? "Broadcasting..." : "Broadcast to Chat"}</span>
          </button>
        </div>
      </div>

      {/* WHAT IS ASYNC STANDUP? (CLEAR CONCEPT EXPLAINER) */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/25 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <span className="font-extrabold text-indigo-500 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-indigo-500" /> 1. No Boring 30-Min Calls
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Eliminates awkward daily Zoom/Google Meet calls where everyone waits their turn. Share your daily update whenever you sit down to work.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-amber-500 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> 2. Cross-Department Handshake
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Stuck waiting on Marketing or Backend? Tag that department right here to immediately alert their Lead and remove bottlenecks.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-extrabold text-emerald-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3. Instant Lead Radar
          </span>
          <p className="text-(--color-desc) leading-relaxed">
            Leads see whole-team readiness in 30 seconds, know who is blocked, and can nudge missing members with a 1-click chat ping.
          </p>
        </div>
      </div>

      {/* SECTION 1: MY DAILY PULSE FORM (60 SECONDS CHECK-IN) */}
      <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-(--color-border)/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-(--color-text)">My Morning 60-Second Check-In</h2>
              <p className="text-[11px] text-(--color-desc)">Fill once a day. You can update it anytime.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-(--color-desc) bg-(--hover-card-bg) px-3 py-1 rounded-xl border border-(--color-border)">
            Today: {selectedDate}
          </span>
        </div>

        <form onSubmit={handleSubmitPulse} className="space-y-5">
          {/* STEP 1: YESTERDAY'S ACCOMPLISHMENTS (AUTO-FETCHED OR MANUAL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="block text-xs font-bold text-(--color-text) flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>1. What did you finish yesterday?</span>
                <span className="text-[10px] text-(--color-desc) font-normal">(Auto-suggested from completed tasks)</span>
              </label>
            </div>

            {/* AUTO-COMPLETED TASK CHIPS FOR 1-CLICK ADD */}
            {autoCompletedTasks.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auto-detected:
                </span>
                {autoCompletedTasks.map((title, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!yesterdayTasks.includes(title) && yesterdayTasks.length < 5) {
                        setYesterdayTasks([...yesterdayTasks, title]);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{title}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Finished Payment Gateway API integration, reviewed PR #12..."
                value={yesterdayInput}
                onChange={(e) => setYesterdayInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddYesterdayTask();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddYesterdayTask}
                className="px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) hover:bg-(--color-border) border border-(--color-border) text-xs font-bold text-(--color-text) transition-colors cursor-pointer"
                title="Add Accomplishment"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {yesterdayTasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {yesterdayTasks.map((task, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold"
                  >
                    <Check className="w-3 h-3" />
                    <span>{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveYesterdayTask(idx)}
                      className="hover:text-rose-500 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: TODAY'S FOCUS TASKS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="block text-xs font-bold text-(--color-text) flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>2. What are your 1-3 primary focus tasks today?</span>
              </label>
              {myAssignedTasks.length > 0 && (
                <span className="text-[11px] text-(--color-desc)">
                  Click assigned task below to import:
                </span>
              )}
            </div>

            {/* 1-CLICK IMPORT OF ASSIGNED ACTIVE TASKS */}
            {myAssignedTasks.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
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
                placeholder="e.g. Build Socket.io team chat handler, polish mobile responsiveness..."
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
                title="Add Focus Task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* FOCUS CHIPS */}
            {focusTasks.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {focusTasks.map((task, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-semibold"
                  >
                    <span>{task}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFocusTask(idx)}
                      className="hover:text-rose-500 cursor-pointer ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* STEP 3: BLOCKER TOGGLE & DEPARTMENT TAGGING */}
          <div className="p-4 rounded-2xl bg-(--hover-card-bg)/50 border border-(--color-border) space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-bold text-(--color-text) flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>3. Are you blocked by any team, person, or external dependency?</span>
                </p>
                <p className="text-[11px] text-(--color-desc)">
                  Flagging a blocker immediately highlights your card on your Lead&apos;s radar so you get unblocked fast.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setHasBlocker(false);
                    setBlockedByDeptId("");
                    setBlockersText("");
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !hasBlocker
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-(--card-bg) border border-(--color-border) text-(--color-desc)"
                  }`}
                >
                  ✅ All Clear
                </button>
                <button
                  type="button"
                  onClick={() => setHasBlocker(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hasBlocker
                      ? "bg-rose-500 text-white shadow-xs"
                      : "bg-(--card-bg) border border-(--color-border) text-(--color-desc)"
                  }`}
                >
                  ⚠️ I Am Blocked
                </button>
              </div>
            </div>

            {hasBlocker && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-(--color-text) mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Which Department is blocking you?</span>
                    </label>
                    <select
                      value={blockedByDeptId}
                      onChange={(e) => setBlockedByDeptId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-(--card-bg) border border-rose-500/40 text-xs font-medium text-(--color-text) focus:outline-hidden"
                    >
                      <option value="">-- Select Blocking Department --</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} Department
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-(--color-text) mb-1">
                      Briefly describe the bottleneck:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Waiting on Figma auth UI screens, or Backend API endpoint..."
                      value={blockersText}
                      onChange={(e) => setBlockersText(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-(--card-bg) border border-rose-500/40 text-xs text-(--color-text) focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 4: BANDWIDTH & ENERGY MOOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>4. Estimated Focus Hours Today</span>
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
              <label className="block text-xs font-bold text-(--color-text) mb-1.5 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-amber-500" />
                <span>5. Energy & Readiness Score</span>
              </label>
              <div className="flex items-center gap-2">
                {[
                  { score: 5, label: "🚀 5 Peak" },
                  { score: 4, label: "😊 4 Good" },
                  { score: 3, label: "😐 3 Mid" },
                  { score: 2, label: "😴 2 Low" },
                  { score: 1, label: "🛑 1 Blocked" },
                ].map((item) => (
                  <button
                    key={item.score}
                    type="button"
                    onClick={() => setEnergyScore(item.score)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      energyScore === item.score
                        ? "bg-amber-500 text-black shadow-xs font-black"
                        : "bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] text-(--color-desc)">
              Takes under 60 seconds • Keeps everyone aligned without a single call
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-(--color-primary) hover:opacity-90 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Logging Pulse..." : "Log Morning Pulse (60s)"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: DEPARTMENT READINESS RADAR (LEAD & TEAM VIEW) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-(--color-text) flex items-center gap-2">
              <Users2 className="w-5 h-5 text-indigo-500" />
              <span>Department Readiness Radar</span>
            </h2>
            <p className="text-xs text-(--color-desc)">
              Real-time pulse overview for Leads, Members, and Cross-department teams.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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
                  {d.name} Department
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">Check-In Rate</p>
            <p className="text-xl font-black text-(--color-text) mt-1">
              {deptStats.totalSubmissions} / {deptStats.totalDepartmentMembers || deptStats.totalSubmissions}{" "}
              <span className="text-xs font-medium text-emerald-500">({deptStats.submissionRate}%)</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Committed Bandwidth</p>
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

        {/* ATTENDANCE TRACKER: MISSING CHECK-INS & 1-CLICK NUDGE */}
        {missingMembers.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {missingMembers.length} team member{missingMembers.length > 1 ? "s have" : " has"} not logged their morning pulse yet
                </p>
              </div>
              <span className="text-[10px] text-(--color-desc)">1-Click direct chat nudge available</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {missingMembers.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-linear-to-tr from-amber-500 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center">
                    {m.name ? m.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="font-semibold text-(--color-text)">{m.name}</span>
                  <span className="text-[10px] text-(--color-desc)">({m.role})</span>
                  <button
                    type="button"
                    onClick={() => handleNudgeMember(m._id, m.name)}
                    disabled={nudgingUserId === m._id}
                    className="ml-1 px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500 text-amber-700 dark:text-amber-300 hover:text-black font-bold text-[10px] transition-colors cursor-pointer"
                  >
                    {nudgingUserId === m._id ? "Pinging..." : "⚡ Nudge in Chat"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                className={`p-5 rounded-3xl bg-(--card-bg) border shadow-xs space-y-3 transition-all ${
                  pulse.hasBlocker ? "border-rose-500/50 bg-rose-500/5" : "border-(--color-border)"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {pulse.userId?.name ? pulse.userId.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-(--color-text)">{pulse.userId?.name}</p>
                        {pulse.userId?.role && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-(--hover-card-bg) text-(--color-desc)">
                            {pulse.userId.role}
                          </span>
                        )}
                      </div>
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

                {/* YESTERDAY'S ACCOMPLISHMENTS IF RECORDED */}
                {pulse.yesterdayTasks && pulse.yesterdayTasks.length > 0 && (
                  <div className="space-y-1 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Yesterday&apos;s Wins:
                    </p>
                    <ul className="list-disc list-inside text-xs text-(--color-text) space-y-0.5">
                      {pulse.yesterdayTasks.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* TODAY'S FOCUS TASKS */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-(--color-desc) flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Today&apos;s Focus:
                  </p>
                  <ul className="list-disc list-inside text-xs text-(--color-text) space-y-0.5">
                    {pulse.focusTasks.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>

                {/* BLOCKER IF ANY */}
                {pulse.hasBlocker && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-500 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Active Bottleneck</span>
                      </p>
                      {pulse.blockedByDepartmentId && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Blocked by: {pulse.blockedByDepartmentId.name}
                        </span>
                      )}
                    </div>
                    {pulse.blockers && (
                      <p className="text-[11px] text-(--color-text) leading-relaxed">
                        {pulse.blockers}
                      </p>
                    )}
                    <div className="pt-1 flex items-center gap-3">
                      <Link
                        href="/dashboard/team/chat"
                        className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Discuss in Chat
                      </Link>
                      <Link
                        href="/dashboard/team/tickets"
                        className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                      >
                        <span>Cross-Dept Ticket</span>
                        <ArrowRight className="w-3 h-3" />
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
