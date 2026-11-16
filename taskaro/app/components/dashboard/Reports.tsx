"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { protectedApiGet } from "@/lib/api";
import {
  TrendingUp,
  Zap,
  CheckCircle2,
  Clock,
  Flame,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  BarChart3,
  PieChart as PieIcon,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Layers,
  ListChecks,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "year";

interface KPIStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeRate: number;
  productivityScore: number;
  habitConsistency: number;
  topStreak: number;
  totalHabits: number;
}

interface VelocityPoint {
  [key: string]: any;
  date: string;
  label: string;
  created: number;
  completed: number;
}

interface PriorityStat {
  [key: string]: any;
  priority: "high" | "medium" | "low";
  label: string;
  total: number;
  done: number;
  inprogress: number;
  todo: number;
  rate: number;
  color: string;
}

interface DayActivity {
  [key: string]: any;
  day: string;
  completed: number;
  created: number;
}

interface SmartInsight {
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}

interface TaskSummaryItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface AnalyticsData {
  range: TimeRange;
  kpis: KPIStats;
  velocityTrend: VelocityPoint[];
  priorityBreakdown: PriorityStat[];
  dayOfWeekActivity: DayActivity[];
  insights: SmartInsight[];
  bestDay: string;
  tasksSummary: TaskSummaryItem[];
}

export default function Reports() {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerFilter, setLedgerFilter] = useState<"all" | "done" | "pending" | "overdue">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalytics = useCallback(async (selectedRange: TimeRange, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await protectedApiGet(`/secure/analytics?range=${selectedRange}`);
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError(res?.error || "Failed to load analytics data");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to connect to analytics service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return;

    const headers = ["ID", "Title", "Priority", "Status", "Due Date", "Created Date", "Completed Date"];
    const rows = (data.tasksSummary || []).map((t) => [
      t.id,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      t.dueDate || "None",
      t.createdAt,
      t.completedAt || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        `# Taskaro Intelligence & Productivity Audit (${range.toUpperCase()})`,
        `# Generated: ${new Date().toLocaleString()}`,
        `# Productivity Score: ${data.kpis.productivityScore}/100 | Completion Rate: ${data.kpis.completionRate}% | On-Time Rate: ${data.kpis.onTimeRate}%`,
        "",
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `taskaro_analytics_${range}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Summary
  const handlePrint = () => {
    window.print();
  };

  // Filtered Task Ledger
  const filteredLedger = useMemo(() => {
    if (!data?.tasksSummary) return [];
    const today = new Date().toISOString().split("T")[0];

    return data.tasksSummary.filter((t) => {
      if (ledgerFilter === "done") return t.status === "done";
      if (ledgerFilter === "pending") return t.status !== "done";
      if (ledgerFilter === "overdue") {
        return t.status !== "done" && t.dueDate && t.dueDate < today;
      }
      return true;
    });
  }, [data?.tasksSummary, ledgerFilter]);

  // Productivity score tier calculation
  const scoreTier = useMemo(() => {
    const score = data?.kpis?.productivityScore ?? 0;
    if (score >= 85) return { label: "Elite Velocity", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 70) return { label: "High Flow", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" };
    if (score >= 50) return { label: "Steady Rhythm", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
    return { label: "Needs Alignment", color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" };
  }, [data?.kpis?.productivityScore]);

  return (
    <div className="space-y-6 pb-12 w-full max-w-7xl mx-auto">
      {/* Top Header & Range Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-2">
            <Sparkles size={12} />
            INTELLIGENCE & VELOCITY SUITE
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-(--color-text) flex items-center gap-2.5">
            <BarChart3 className="text-blue-500" size={28} />
            Analytics & Performance
          </h1>
          <p className="text-sm text-(--color-desc) mt-1">
            Real-time execution velocity, on-time delivery rates, and habit synergy insights.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Pills */}
          <div className="inline-flex p-1 rounded-xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            {(
              [
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "year", label: "1 Year" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  range === tab.id
                    ? "bg-blue-600 text-white shadow-xs font-semibold"
                    : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics(range, true)}
            disabled={loading || refreshing}
            title="Refresh analytics data"
            className="p-2 rounded-xl border border-(--color-border) bg-(--card-bg) text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-500" : ""} />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={!data || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-all disabled:opacity-50 shadow-xs"
          >
            <Download size={14} className="text-blue-500" />
            <span>Export CSV</span>
          </button>

          {/* Print Summary */}
          <button
            onClick={handlePrint}
            disabled={!data || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-all disabled:opacity-50 shadow-xs print:hidden"
          >
            <Printer size={14} className="text-(--color-desc)" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Inline Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAnalytics(range)}
            className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-(--card-bg) border border-(--color-border) opacity-60" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 rounded-2xl bg-(--card-bg) border border-(--color-border) opacity-60" />
            <div className="h-80 rounded-2xl bg-(--card-bg) border border-(--color-border) opacity-60" />
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Section 1: Executive KPI Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Productivity Score */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs hover:border-blue-500/30 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-desc)">
                  Productivity Score
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${scoreTier.bg} ${scoreTier.color}`}>
                  {scoreTier.label}
                </span>
              </div>
              <div className="flex items-baseline gap-3 my-3">
                <span className="text-4xl font-extrabold text-(--color-text) tracking-tight">
                  {data.kpis.productivityScore}
                </span>
                <span className="text-sm font-medium text-(--color-desc)">/ 100</span>
              </div>
              <div className="w-full bg-(--hover-card-bg) h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-linear-to-r from-blue-500 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(5, data.kpis.productivityScore))}%` }}
                />
              </div>
              <p className="text-[11px] text-(--color-desc) mt-2 flex items-center gap-1">
                <Zap size={12} className="text-amber-500" />
                Weighted velocity, high-priority ratio & on-time rhythm
              </p>
            </div>

            {/* KPI 2: Execution Velocity */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs hover:border-emerald-500/30 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-desc)">
                  Completion Velocity
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-3">
                <span className="text-3xl font-extrabold text-(--color-text) tracking-tight">
                  {data.kpis.completionRate}%
                </span>
                <span className="text-xs font-medium text-(--color-desc)">
                  ({data.kpis.completedTasks} of {data.kpis.totalTasks} closed)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-desc)">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {data.kpis.inProgressTasks} in progress
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {data.kpis.todoTasks} backlog
                </span>
              </div>
              <p className="text-[11px] text-(--color-desc) mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Tasks resolved within the selected {range} window
              </p>
            </div>

            {/* KPI 3: On-Time Delivery */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs hover:border-blue-500/30 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-desc)">
                  On-Time Delivery
                </span>
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                  <Clock size={16} />
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-3">
                <span className="text-3xl font-extrabold text-(--color-text) tracking-tight">
                  {data.kpis.onTimeRate}%
                </span>
                <span className="text-xs font-medium text-(--color-desc)">adherence</span>
              </div>
              <div className="flex items-center gap-2">
                {data.kpis.overdueTasks > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {data.kpis.overdueTasks} overdue backlog
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    100% on schedule
                  </span>
                )}
              </div>
              <p className="text-[11px] text-(--color-desc) mt-2">
                Completed on or prior to target due date
              </p>
            </div>

            {/* KPI 4: Routine & Habit Synergy */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs hover:border-purple-500/30 transition flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-desc)">
                  Habit Consistency
                </span>
                <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <Flame size={16} />
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-3">
                <span className="text-3xl font-extrabold text-(--color-text) tracking-tight">
                  {data.kpis.habitConsistency}%
                </span>
                <span className="text-xs font-medium text-(--color-desc)">today</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold flex items-center gap-1">
                  <Flame size={12} />
                  {data.kpis.topStreak}d streak record
                </span>
                <span className="text-(--color-desc)">({data.kpis.totalHabits} routines)</span>
              </div>
              <p className="text-[11px] text-(--color-desc) mt-2 flex items-center gap-1">
                <Calendar size={12} className="text-purple-500" />
                Cross-system habit routine stabilization
              </p>
            </div>
          </div>

          {/* Section 2: Execution Velocity Spline + Priority Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Velocity Spline Area Chart (2 cols) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    Execution Velocity Burndown
                  </h2>
                  <p className="text-xs text-(--color-desc) mt-0.5">
                    Tasks created vs tasks marked done over time
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-(--color-desc)">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-(--color-desc)">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Created
                  </span>
                </div>
              </div>

              <div className="w-full h-72">
                {mounted && data.velocityTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.velocityTrend}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="currentColor"
                        className="text-[11px] text-(--color-desc)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="currentColor"
                        className="text-[11px] text-(--color-desc)"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl bg-(--card-bg) border border-(--color-border) shadow-lg text-xs space-y-1">
                                <div className="font-semibold text-(--color-text) pb-1 border-b border-(--color-border)">
                                  {p.label}
                                </div>
                                <div className="text-emerald-500 font-medium flex items-center justify-between gap-4">
                                  <span>Completed:</span>
                                  <span className="font-bold">{p.completed}</span>
                                </div>
                                <div className="text-blue-500 font-medium flex items-center justify-between gap-4">
                                  <span>Created:</span>
                                  <span className="font-bold">{p.created}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                      <Area
                        type="monotone"
                        dataKey="created"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#colorCreated)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-(--color-desc)">
                    No activity data available in this timeframe
                  </div>
                )}
              </div>
            </div>

            {/* Priority Impact Matrix (1 col) */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                  <PieIcon size={18} className="text-amber-500" />
                  Priority Distribution
                </h2>
                <p className="text-xs text-(--color-desc) mt-0.5">
                  Task allocation by urgency level
                </p>
              </div>

              {/* Donut Chart */}
              <div className="w-full h-44 my-2">
                {mounted && data.priorityBreakdown?.some((p) => p.total > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.priorityBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="total"
                      >
                        {data.priorityBreakdown.map((entry) => (
                          <Cell key={entry.priority} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload as PriorityStat;
                            return (
                              <div className="p-2.5 rounded-xl bg-(--card-bg) border border-(--color-border) shadow-md text-xs">
                                <span className="font-semibold text-(--color-text)">{p.label} Priority</span>
                                <div className="text-(--color-desc) mt-0.5">
                                  Total: <span className="font-bold text-(--color-text)">{p.total}</span> ({p.done} done)
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-(--color-desc)">
                    No priority distribution data
                  </div>
                )}
              </div>

              {/* Priority Completion Bars */}
              <div className="space-y-2.5">
                {data.priorityBreakdown.map((item) => (
                  <div key={item.priority} className="text-xs space-y-1">
                    <div className="flex items-center justify-between text-(--color-desc)">
                      <span className="font-medium capitalize text-(--color-text) flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.label}
                      </span>
                      <span>
                        {item.done} / {item.total} ({item.rate}%)
                      </span>
                    </div>
                    <div className="w-full bg-(--hover-card-bg) h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.rate}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Weekday Rhythm + Smart Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekday Rhythm Chart */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-500" />
                    Weekly Productivity Rhythm
                  </h2>
                  <p className="text-xs text-(--color-desc) mt-0.5">
                    Completion volume across days of the week
                  </p>
                </div>
                {data.bestDay && data.bestDay !== "None" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center gap-1">
                    <Zap size={12} />
                    Power Day: {data.bestDay}
                  </span>
                )}
              </div>

              <div className="w-full h-56">
                {mounted && data.dayOfWeekActivity?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.dayOfWeekActivity}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        stroke="currentColor"
                        className="text-[11px] text-(--color-desc)"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="currentColor"
                        className="text-[11px] text-(--color-desc)"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0].payload as DayActivity;
                            return (
                              <div className="p-2.5 rounded-xl bg-(--card-bg) border border-(--color-border) shadow-md text-xs">
                                <span className="font-semibold text-(--color-text)">{p.day}</span>
                                <div className="text-emerald-500 mt-1">
                                  Completed: <span className="font-bold">{p.completed}</span>
                                </div>
                                <div className="text-blue-500">
                                  Created: <span className="font-bold">{p.created}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-(--color-desc)">
                    No weekday activity data
                  </div>
                )}
              </div>
            </div>

            {/* Smart Insights & Bottleneck Radar */}
            <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  Productivity Radar & Actionable Insights
                </h2>
                <p className="text-xs text-(--color-desc) mt-0.5">
                  Automated intelligence derived from your work patterns
                </p>
              </div>

              <div className="space-y-3 my-4">
                {data.insights && data.insights.length > 0 ? (
                  data.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                        insight.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : insight.type === "warning"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <div className="mt-0.5">
                        {insight.type === "success" && <CheckCircle2 size={16} />}
                        {insight.type === "warning" && <AlertTriangle size={16} />}
                        {insight.type === "info" && <Info size={16} />}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-(--color-text)">{insight.title}</div>
                        <div className="text-(--color-desc) leading-relaxed">{insight.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-desc) text-center">
                    Keep logging tasks and habits to unlock automated behavioral recommendations!
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-(--color-border) flex items-center justify-between text-xs text-(--color-desc)">
                <span>Engine: Taskaro Heuristics v2.4</span>
                <span className="text-blue-500 font-medium">Updated every check-in</span>
              </div>
            </div>
          </div>

          {/* Section 4: Recent Task Ledger & Audit Trail */}
          <div className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-(--color-text) flex items-center gap-2">
                  <ListChecks size={18} className="text-blue-500" />
                  Productivity Ledger & Audit Trail
                </h2>
                <p className="text-xs text-(--color-desc) mt-0.5">
                  Detailed task activity behind your velocity metrics
                </p>
              </div>

              {/* Ledger Filter Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "done", label: "Completed" },
                    { id: "pending", label: "Pending" },
                    { id: "overdue", label: "Overdue" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLedgerFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      ledgerFilter === f.id
                        ? "bg-(--card-bg) text-(--color-text) shadow-xs font-semibold"
                        : "text-(--color-desc) hover:text-(--color-text)"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-(--color-border) text-(--color-desc)">
                    <th className="pb-2.5 font-semibold">TASK TITLE</th>
                    <th className="pb-2.5 font-semibold">PRIORITY</th>
                    <th className="pb-2.5 font-semibold">DUE DATE</th>
                    <th className="pb-2.5 font-semibold">STATUS</th>
                    <th className="pb-2.5 font-semibold text-right">COMPLETED ON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  {filteredLedger.length > 0 ? (
                    filteredLedger.slice(0, 10).map((t) => (
                      <tr key={t.id} className="hover:bg-(--hover-card-bg) transition-colors">
                        <td className="py-2.5 pr-3 font-medium text-(--color-text) max-w-xs truncate">
                          {t.title}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              t.priority === "high"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : t.priority === "medium"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            }`}
                          >
                            {t.priority.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-(--color-desc)">
                          {t.dueDate || "No deadline"}
                        </td>
                        <td className="py-2.5 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                              t.status === "done"
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : t.status === "inprogress"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                            }`}
                          >
                            {t.status === "done" ? "Done" : t.status === "inprogress" ? "In Progress" : "To Do"}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-(--color-desc) font-mono">
                          {t.completedAt || "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-(--color-desc)">
                        No tasks match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {filteredLedger.length > 10 && (
              <div className="pt-3 text-center border-t border-(--color-border) text-xs text-(--color-desc)">
                Showing 10 of {filteredLedger.length} tasks recorded in this timeframe. Use Export CSV for the full ledger.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
