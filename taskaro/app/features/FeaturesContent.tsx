"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  BellRing,
  Flame,
  BarChart3,
  Calendar,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  Brain,
  Clock,
  Volume2,
  TrendingUp,
  Download,
  Moon,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function FeaturesContent() {
  const [activeCategory, setActiveCategory] = useState<"all" | "tasks" | "alarms" | "habits" | "analytics">("all");

  const coreFeatures = [
    {
      category: "tasks",
      icon: <CheckSquare className="w-6 h-6 text-blue-500" />,
      tag: "CORE EXECUTION",
      title: "Task Command Center",
      description:
        "Triage your workload with High, Medium, and Low priorities. Schedule target due dates with calendar integration and instant search.",
      highlights: [
        "Priority-weighted execution (High / Medium / Low)",
        "Unified deadline scheduling & today filters",
        "30-day safety trash recovery ledger",
        "Instant inline search & status tags",
      ],
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      category: "alarms",
      icon: <BellRing className="w-6 h-6 text-indigo-500" />,
      tag: "DISCIPLINE ENGINE",
      title: "Smart Alarm & Cognitive Wake-up",
      description:
        "Never miss a morning focus block. Precision web-worker ticker rings even when the browser is minimized, backed by mental wake-up challenges.",
      highlights: [
        "Background Web Worker clock (immune to tab sleep)",
        "Web Audio synthesizer (Classic, Chime, Energetic, Radar)",
        "Anti-snooze Math & Affirmation Quote puzzles",
        "Gradual volume ramp-up & hardware vibration",
      ],
      badgeColor: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    },
    {
      category: "habits",
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      tag: "ROUTINE ARCHITECTURE",
      title: "Habit Streaks & Consistency",
      description:
        "Build unbreakable daily habits with live streak tracking, custom recurrence (Daily, Weekdays, Weekends), and visual consistency scores.",
      highlights: [
        "Mon–Sun interactive 7-day check-in matrix",
        "Consecutive streak calculation & record badges",
        "Multi-category grouping (Health, Productivity, Mind)",
        "Direct synergy correlation with task output",
      ],
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      category: "analytics",
      icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
      tag: "EXECUTIVE INTELLIGENCE",
      title: "Velocity Burndown & Analytics",
      description:
        "Track execution velocity over 7d, 30d, 90d, and full year. Discover your weekly Power Day and export complete task ledgers in one click.",
      highlights: [
        "Productivity Index score (0 to 100)",
        "Tasks Created vs Tasks Completed spline",
        "Power Day detection across weekly rhythm",
        "1-click native CSV ledger export & print report",
      ],
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      category: "tasks",
      icon: <Calendar className="w-6 h-6 text-purple-500" />,
      tag: "SCHEDULE SYNC",
      title: "Interactive Calendar Workspace",
      description:
        "Unified schedule view that harmonizes your task deadlines and recurring alarms in a single interactive calendar interface.",
      highlights: [
        "Full month & day schedule overview",
        "One-click quick task creation from any date",
        "Visual deadline tags and completion states",
        "Unified time management across work and life",
      ],
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      category: "security",
      icon: <Shield className="w-6 h-6 text-rose-500" />,
      tag: "ENTERPRISE SECURITY",
      title: "Identity & Account Security",
      description:
        "Google OAuth single sign-on alongside two-step email OTP verification for credential accounts, powered by encrypted bcrypt credentials.",
      highlights: [
        "Google Single Sign-On (OAuth 2.0)",
        "Two-factor OTP email verification for password changes",
        "Encrypted database storage and session tokens",
        "Custom avatar upload with instant live preview",
      ],
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
  ];

  const filteredFeatures =
    activeCategory === "all"
      ? coreFeatures
      : coreFeatures.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden border-b border-(--color-border)">
        {/* Glow Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 md:w-[600px] h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles size={14} />
            <span>BUILT FOR MODERN EXECUTION & DISCIPLINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--color-text) leading-tight">
            Everything you need to <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500">
              dominate your daily focus.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-(--color-desc) max-w-2xl mx-auto leading-relaxed">
            Taskaro combines high-velocity task management, cognitive smart alarms,
            daily habit architecture, and real-time execution analytics into one unified SaaS command center.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-2xl border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) font-semibold text-sm transition-all cursor-pointer shadow-xs"
            >
              Open Live Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* FILTER TABS */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-6">
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs text-xs font-semibold overflow-x-auto max-w-full">
            {[
              { id: "all", label: "All Capabilities" },
              { id: "tasks", label: "Task Management" },
              { id: "alarms", label: "Smart Alarms" },
              { id: "habits", label: "Habits & Routine" },
              { id: "analytics", label: "Analytics Suite" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS BENTO GRID */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) group-hover:scale-105 transition-transform">
                    {feat.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${feat.badgeColor}`}>
                    {feat.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-(--color-text) group-hover:text-blue-500 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-(--color-desc) mt-1.5 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-(--color-border) space-y-2">
                {feat.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-2 text-xs text-(--color-desc)">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHITECTURE HIGHLIGHT BANNER */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-3xl border border-(--color-border) bg-(--card-bg) p-8 md:p-12 relative overflow-hidden shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Zap size={14} />
                <span>TECHNICAL EXCELLENCE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-(--color-text) tracking-tight">
                Designed for pure performance and uninterrupted flow.
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Taskaro does not rely on fragile external cron services for critical alarms.
                Our custom inline Web Worker scheduler guarantees clock precision even when your laptop sleeps or your browser is hidden.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border)">
                  <div className="text-xl font-bold text-blue-500">0ms</div>
                  <div className="text-xs text-(--color-desc)">Audio playback latency</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border)">
                  <div className="text-xl font-bold text-emerald-500">100%</div>
                  <div className="text-xs text-(--color-desc)">Zero-toast inline UI</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-(--color-border) bg-(--hover-card-bg) p-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-(--color-border) text-(--color-desc)">
                <span>taskaro-core.manifest</span>
                <span className="text-emerald-500">v2.4 active</span>
              </div>
              <div className="space-y-2 text-(--color-text)">
                <div className="text-blue-500">✓ Web Worker Precision Scheduler</div>
                <div className="text-indigo-500">✓ Web Audio Synthesizer Engine</div>
                <div className="text-purple-500">✓ Cognitive Anti-Snooze Puzzles</div>
                <div className="text-amber-500">✓ Streak Heatmap Synchronization</div>
                <div className="text-emerald-500">✓ Real-time MongoDB Velocity Metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 pt-8 pb-24 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-b from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-(--color-text) tracking-tight">
            Ready to upgrade your daily execution?
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc) max-w-lg mx-auto">
            Join professionals who organize tasks, master wake-up alarms, and maintain daily discipline with Taskaro.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
