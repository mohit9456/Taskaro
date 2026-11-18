import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Target,
  Zap,
  ShieldCheck,
  Flame,
  AlarmClock,
  BarChart3,
  Users2,
  ArrowRight,
  CheckCircle2,
  Cpu,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | The Taskaro Story & Philosophy",
  description:
    "Learn about Taskaro's mission to eliminate productivity chaos and build high-performance daily discipline for creators, engineers, and modern teams.",
  openGraph: {
    title: "About Taskaro | Discipline & Execution Platform",
    description:
      "Taskaro is engineered to transform chaotic task lists into unstoppable daily streaks with cognitive alarms, velocity metrics, and team command hubs.",
  },
};

export default function AboutUsPage() {
  const stats = [
    { value: "99.98%", label: "Cloud Uptime", sub: "Enterprise grade reliability" },
    { value: "< 45ms", label: "Real-time Latency", sub: "Instant team query dispatch" },
    { value: "10,000+", label: "Sprints Completed", sub: "Across engineering & product teams" },
    { value: "3.4x", label: "Consistency Multiplier", sub: "Measured by habit streak retention" },
  ];

  const pillars = [
    {
      icon: AlarmClock,
      color: "from-blue-500 to-indigo-600",
      title: "Cognitive Urgency & Smart Alarms",
      description:
        "Traditional push notifications are easily dismissed and forgotten. Taskaro's smart alarm protocol delivers auditory and visual focus triggers that ensure high-priority deadlines are never missed.",
    },
    {
      icon: Flame,
      color: "from-amber-500 to-orange-600",
      title: "Unbreakable Habit Architecture",
      description:
        "Execution is not a mood; it is an engineered habit. Our streak mechanics, anti-relapse checkpoints, and discipline trackers rewire your daily rhythm for long-term compound momentum.",
    },
    {
      icon: BarChart3,
      color: "from-purple-500 to-pink-600",
      title: "Velocity & Anti-Bottleneck Analytics",
      description:
        "Replace vanity metrics with real operational velocity. Gain deep visibility into task turnaround times, completion consistency, and cognitive overload before burnout sets in.",
    },
    {
      icon: Users2,
      color: "from-emerald-500 to-teal-600",
      title: "Collaborative Command Hub",
      description:
        "Eliminate 30-minute status meetings. Coordinate cross-department dependencies, resolve blocker query tickets with automated 4h SLA timers, and align in 60-second async standups.",
    },
  ];

  const principles = [
    {
      number: "01",
      title: "Frictionless Capture",
      desc: "An idea or task not captured in 3 seconds is lost. Our command interfaces are built for instant capture with zero cognitive resistance.",
    },
    {
      number: "02",
      title: "Radical Visibility",
      desc: "Hidden tasks breed procrastination. Taskaro surfaces what matters right now with priority heatmaps and smart countdowns.",
    },
    {
      number: "03",
      title: "Asynchronous by Default",
      desc: "High performers need deep focus. We replace repetitive meetings with structured query tickets, async pulse checks, and clear SLAs.",
    },
    {
      number: "04",
      title: "Accountability Over Intent",
      desc: "Good intentions do not ship products. We hold you accountable with streak records, blocker alerts, and measurable milestones.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Taskaro Manifesto</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Engineered for Focus. <br className="hidden sm:inline" />
              <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Built for Relentless Execution.
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-(--color-desc) leading-relaxed">
              We started Taskaro because modern productivity tools had become bloated, chaotic digital filing cabinets. We set out to engineer a cognitive workspace that doesn’t just store your tasks — it drives you to finish them.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-2xl bg-(--color-primary) text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span>Experience Taskaro Pro</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="px-6 py-3 rounded-2xl bg-(--card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--hover-card-bg) font-bold text-xs sm:text-sm transition-all"
              >
                Explore Architecture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP */}
      <section className="py-12 bg-(--card-bg) border-b border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((item, idx) => (
              <div key={idx} className="space-y-1 text-center sm:text-left">
                <p className="text-2xl sm:text-4xl font-black text-(--color-text) tracking-tight">
                  {item.value}
                </p>
                <p className="text-xs sm:text-sm font-bold text-(--color-primary)">
                  {item.label}
                </p>
                <p className="text-[11px] text-(--color-desc)">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE ARCHITECTURAL PILLARS */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-(--color-desc)">
              Why We Are Different
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-(--color-text) tracking-tight">
              A System Designed Around Human Psychology
            </h2>
            <p className="text-xs sm:text-sm text-(--color-desc)">
              Task lists fail when they ignore motivation, cognitive friction, and fatigue. Taskaro is built from the ground up to counteract procrastination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 hover:border-(--color-primary)/50 transition-all shadow-xs"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${pillar.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-(--color-text)">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. THE FOUR LAWS */}
      <section className="py-16 md:py-24 bg-(--card-bg) border-y border-(--color-border)">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
              Operating Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-(--color-text) tracking-tight">
              The 4 Laws of Taskaro Engineering
            </h2>
            <p className="text-xs sm:text-sm text-(--color-desc)">
              Every button, micro-interaction, and database query in Taskaro is held against these core engineering convictions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-6 bg-(--hover-card-bg)/60 border border-(--color-border) space-y-3"
              >
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-(--card-bg) border border-(--color-border) text-indigo-500 inline-block">
                  {item.number}
                </span>
                <h4 className="text-base font-bold text-(--color-text)">{item.title}</h4>
                <p className="text-xs text-(--color-desc) leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white shadow-xl text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Upgrade How You Work?
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto leading-relaxed">
              Join thousands of professionals and teams who have replaced chaotic task lists with systematic execution.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-2xl bg-white text-gray-900 font-extrabold text-xs sm:text-sm hover:bg-white/90 transition-all shadow-md"
              >
                Create Free Account
              </Link>
              <Link
                href="/contact-us"
                className="px-6 py-3 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all"
              >
                Talk to Product Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
