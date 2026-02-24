"use client";
import { useState } from "react";
import { FaDumbbell, FaTint, FaBed, FaClock, FaFire } from "react-icons/fa";


const TABS = ["Overview", "Analytics", "Insights", "History", "Sync"];

export default function HabitOverviewPage() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white p-4 md:p-8 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">🧩 Habit System</h1>
        <p className="text-gray-400 mt-1">
          Your lifestyle patterns, discipline & consistency — all in one place
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm transition
              ${
                activeTab === tab
                  ? "bg-linear-to-r from-indigo-500 to-purple-600"
                  : "bg-[#161b2e] text-gray-300 hover:bg-[#1f2540]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === "Overview" && <Overview />}
      {activeTab === "Analytics" && <Analytics />}
      {activeTab === "Insights" && <Insights />}
      {activeTab === "History" && <History />}
      {activeTab === "Sync" && <Sync />}
    </div>
  );
}



function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "🌙 Late night focus";
  if (hour < 12) return "🌅 Morning momentum";
  if (hour < 18) return "☀️ Midday balance";
  return "🌆 Evening recovery";
}

function getScoreInsight(score) {
  if (score >= 85)
    return {
      label: "Peak Discipline",
      message: "You're operating at an elite level today. Protect this rhythm.",
      tone: "from-green-500 to-emerald-600",
    };

  if (score >= 70)
    return {
      label: "Stable System",
      message:
        "You're consistent, but one weak habit is pulling the system down.",
      tone: "from-indigo-600 to-purple-700",
    };

  return {
    label: "System Under Stress",
    message:
      "Too many habits are misaligned. Fix sleep or alarms first.",
    tone: "from-red-500 to-pink-600",
  };
}

function Overview() {
  const score = 72;
  const greeting = getTimeGreeting();
  const insight = getScoreInsight(score);

  return (
    <div className="space-y-8">
      {/* SYSTEM SCORE */}
      <div
        className={`rounded-2xl bg-linear-to-br ${insight.tone} p-6 shadow-lg`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-90">{greeting}</p>
            <h2 className="text-2xl font-semibold mt-1">
              {insight.label}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-5xl font-bold">{score}%</p>
            <p className="text-xs opacity-80">Consistency Score</p>
          </div>
        </div>

        <p className="text-sm mt-4 opacity-90 max-w-xl">
          {insight.message}
        </p>
      </div>

      {/* HABIT STATUS */}
      <div className="grid md:grid-cols-4 gap-4">
        <HabitCard
          icon={<FaDumbbell />}
          title="Gym"
          status="Done"
          streak={6}
          sub="Strong momentum"
          color="from-green-500 to-emerald-600"
        />
        <HabitCard
          icon={<FaTint />}
          title="Water"
          status="Missed"
          streak={3}
          sub="Below target today"
          color="from-blue-500 to-cyan-600"
        />
        <HabitCard
          icon={<FaBed />}
          title="Sleep"
          status="Weak"
          streak={1}
          sub="Less than 7h avg"
          color="from-red-500 to-pink-600"
        />
        <HabitCard
          icon={<FaClock />}
          title="Alarm"
          status="Followed"
          streak={5}
          sub="No snoozes"
          color="from-yellow-500 to-orange-500"
        />
      </div>

      {/* AI MICRO INSIGHT */}
      <div className="rounded-xl bg-(--card-bg) p-5 border border-white/10">
        <h3 className="font-medium mb-2">🤖 System Insight</h3>
        <p className="text-sm text-gray-300">
          On days when you sleep less than 6h, your alarm discipline
          drops by <span className="text-indigo-400 font-medium">38%</span>.
          Fixing sleep alone can push your consistency above{" "}
          <span className="text-green-400 font-medium">80%</span>.
        </p>
      </div>
    </div>
  );
}

/* ---------------- HABIT CARD ---------------- */

function HabitCard({ icon, title, status, streak, sub, color }) {
  return (
    <div
      className={`rounded-xl bg-linear-to-br ${color} p-4 text-white shadow`}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
      </div>

      <p className="mt-3 text-sm opacity-90">
        Status: <span className="font-medium">{status}</span>
      </p>

      <p className="text-xs opacity-80 mt-1">{sub}</p>

      <p className="mt-3 text-xs">
        🔥 {streak}-day streak
      </p>
    </div>
  );
}


function Analytics() {
  return (
    <div className="space-y-10">
      {/* OVERVIEW */}
      <Section
        title="Habit Performance Overview"
        subtitle="How consistently you're maintaining different life areas"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat
            label="Physical Strength"
            value="82%"
            hint="Gym + Walk consistency"
            color="green"
          />
          <Stat
            label="Health Balance"
            value="61%"
            hint="Water + Sleep patterns"
            color="yellow"
          />
          <Stat
            label="Daily Discipline"
            value="74%"
            hint="Alarm & routine follow-through"
            color="indigo"
          />
        </div>
      </Section>

      {/* TIME INSIGHT */}
      <Section
        title="Best Performance Window"
        subtitle="Time range where habits succeed most"
      >
        <div className="rounded-lg bg-[#0f1424] p-4 border border-indigo-500/30">
          <p className="text-2xl font-semibold text-indigo-400">
            🌅 6:00 AM – 8:00 AM
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Most of your successful habits (Gym, Water, Alarm) occur during early
            morning hours.
          </p>
        </div>
      </Section>

      {/* WEAK POINTS */}
      <Section
        title="Weak Signals Detected"
        subtitle="Habits that are silently affecting your growth"
      >
        <InsightCard
          emoji="💤"
          title="Sleep inconsistency"
          description="Irregular sleep is reducing alarm effectiveness and gym energy."
        />
        <InsightCard
          emoji="🚰"
          title="Water intake drops post noon"
          description="Hydration falls sharply after 2 PM, impacting recovery."
        />
      </Section>

      {/* SYSTEM INSIGHT */}
      <Section
        title="System-Level Insight"
        subtitle="How habits influence each other"
      >
        <div className="space-y-2 text-sm text-gray-300">
          <p>🔗 Strong link: Gym → Water</p>
          <p>🔗 Medium link: Water → Sleep</p>
          <p className="text-red-400">
            ⚠️ Weak link: Sleep → Alarm discipline
          </p>
        </div>
      </Section>

      {/* ACTIONABLE SUGGESTION */}
      <div className="rounded-xl bg-linear-to-br from-indigo-600 to-purple-700 p-5">
        <h3 className="font-semibold text-white">
          🧠 Personalized Recommendation
        </h3>
        <p className="text-sm opacity-90 mt-2">
          Fixing <b>sleep timing</b> will automatically improve alarm discipline
          and gym performance.
        </p>
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Stat({ label, value, hint, color }) {
  const colorMap = {
    green: "text-green-400 border-green-500/40",
    yellow: "text-yellow-400 border-yellow-500/40",
    indigo: "text-indigo-400 border-indigo-500/40",
  };

  return (
    <div className={`rounded-lg bg-[#0f1424] p-4 border ${colorMap[color]}`}>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{hint}</p>
    </div>
  );
}

function InsightCard({ emoji, title, description }) {
  return (
    <div className="flex gap-4 rounded-lg bg-[#0f1424] p-4 border border-white/5">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
    </div>
  );
}

function Insights() {
  return (
    <div className="space-y-4">
      <Insight text="You are 2x more consistent on days when Gym & Water are completed together." />
      <Insight text="Missing sleep reduces next-day gym success by 40%." />
      <Insight text="Morning alarms are far more effective than evening ones." />
    </div>
  );
}

function Insight({ text }) {
  return (
    <div className="rounded-lg bg-[#161b2e] p-4 border border-indigo-500/30">
      🧠 {text}
    </div>
  );
}

function History() {
  return (
    <div className="space-y-3">
      <DayRow day="Monday" status="🔥 All habits done" />
      <DayRow day="Tuesday" status="⚠️ Sleep missed" />
      <DayRow day="Wednesday" status="💧 Only water completed" />
      <DayRow day="Thursday" status="😴 Low discipline day" />
    </div>
  );
}

function DayRow({ day, status }) {
  return (
    <div className="flex justify-between bg-[#161b2e] p-3 rounded-lg">
      <span>{day}</span>
      <span className="text-gray-400">{status}</span>
    </div>
  );
}

function Sync() {
  return (
    <div className="space-y-8">
      {/* INTRO */}
      <div className="rounded-xl bg-[#161b2e] p-5 border border-indigo-500/30">
        <h3 className="text-lg font-semibold text-white">
          🔗 Habit Synchronization
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Your habits don’t work in isolation. One action directly impacts the
          success of another.
        </p>
      </div>

      {/* CONNECTION MAP */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-indigo-400">
          Connected Habits
        </h4>

        <SyncCard
          title="Gym ↔ Water"
          strength="Strong"
          color="green"
          description="When you complete your gym habit, your water intake consistency improves significantly."
        />

        <SyncCard
          title="Water ↔ Sleep"
          strength="Medium"
          color="yellow"
          description="Good hydration slightly improves sleep quality, but consistency is missing."
        />

        <SyncCard
          title="Sleep ↔ Alarm"
          strength="Weak"
          color="red"
          description="Irregular sleep causes alarms to be ignored or snoozed frequently."
        />
      </div>

      {/* SYSTEM SUGGESTION */}
      <div className="rounded-xl bg-linear-to-br from-indigo-600 to-purple-700 p-5">
        <h4 className="font-semibold text-white">
          🧠 System Recommendation
        </h4>
        <p className="text-sm mt-2 opacity-90">
          Fixing <b>Sleep discipline</b> will automatically improve your Alarm
          follow rate and Gym consistency.
        </p>
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition">
          Optimize Habit Connections
        </button>
      </div>
    </div>
  );
}


function SyncCard({ title, strength, description, color }) {
  const colorMap = {
    green: "border-green-500/40 text-green-400",
    yellow: "border-yellow-500/40 text-yellow-400",
    red: "border-red-500/40 text-red-400",
  };

  return (
    <div
      className={`rounded-lg bg-[#0f1424] p-4 border ${colorMap[color]}`}
    >
      <div className="flex justify-between items-center">
        <h5 className="font-medium text-white">{title}</h5>
        <span className="text-xs font-semibold">{strength}</span>
      </div>
      <p className="text-sm text-gray-400 mt-2">{description}</p>
    </div>
  );
}