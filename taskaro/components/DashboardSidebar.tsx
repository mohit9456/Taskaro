"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaCheckSquare } from "react-icons/fa";
import { MdStackedBarChart } from "react-icons/md";
import {
  LuLayoutDashboard,
  LuPlus,
  LuCalendar,
  LuBell,
  LuTrash2,
  LuMenu,
  LuX,
  LuCrown,
  LuDumbbell,
  LuAlarmClock,
  LuDroplets,
  LuRepeat,
  LuUsers,
} from "react-icons/lu";
import ThemeToggle from "./ThemeToggle";

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    if (pathname === "/dashboard") setActive("dashboard");
    else setActive(pathname.split("/")[2] || "");
  }, [pathname]);

  const go = (key: string) => {
    setActive(key);
    setSidebarOpen(false);
    key === "dashboard"
      ? router.push("/dashboard")
      : router.push(`/dashboard/${key}`);
  };

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-20 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-(--card-bg) border border-(--color-border) text-(--color-text) shadow"
        >
          {sidebarOpen ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative z-40 h-screen w-64 bg-(--card-bg) border-r border-(--color-border) px-4 py-6
        transform transition-all duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 overflow-y-auto`}
      >
        {/* LOGO & THEME */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-(--color-text)">Taskaro</h1>
          <ThemeToggle />
        </div>

        {/* ===== CORE ===== */}
        <Section title="Core">
          <Item
            icon={<LuLayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={active === "dashboard"}
            onClick={() => go("dashboard")}
          />
          <Item
            icon={<FaCheckSquare className="w-4 h-4" />}
            label="My Tasks"
            active={active === "my-tasks"}
            onClick={() => go("my-tasks")}
          />
          <Item
            icon={<LuPlus className="w-5 h-5" />}
            label="Create Task"
            active={active === "create-task"}
            onClick={() => go("create-task")}
          />
          <Item
            icon={<LuCalendar className="w-5 h-5" />}
            label="Calendar"
            active={active === "calendar"}
            onClick={() => go("calendar")}
          />
        </Section>

        {/* ===== LIFE TOOLS ===== */}
        <Section title="Life Tools">
          <Item
            icon={<LuAlarmClock className="w-5 h-5" />}
            label="Smart Alarms"
            badge="NEW"
            active={active === "smart-alarm"}
            onClick={() => go("smart-alarm")}
          />
          <Item
            icon={<LuDumbbell className="w-5 h-5" />}
            label="Gym Tracker"
            badge="🔥"
            active={active === "gym"}
            onClick={() => go("gym")}
          />
          <Item
            icon={<LuDroplets className="w-5 h-5" />}
            label="Water Tracker"
            active={active === "water"}
            onClick={() => go("water")}
          />
          <Item
            icon={<LuRepeat className="w-5 h-5" />}
            label="Habits"
            active={active === "habits"}
            onClick={() => go("habits")}
          />
        </Section>

        {/* ===== INSIGHTS ===== */}
        <Section title="Insights">
          <Item
            icon={<MdStackedBarChart className="w-5 h-5" />}
            label="Reports"
            active={active === "reports"}
            onClick={() => go("reports")}
          />
          <Item
            icon={<LuBell className="w-5 h-5" />}
            label="Notifications"
            active={active === "notification"}
            onClick={() => go("notification")}
          />
          <Item
            icon={<LuTrash2 className="w-5 h-5" />}
            label="Trash"
            active={active === "trash"}
            onClick={() => go("trash")}
          />
        </Section>

        {/* ===== PRO ===== */}
        <Section title="Team (Pro)">
          <LockedItem label="Team Workspace" />
          <LockedItem label="Invite Members" />
        </Section>

        {/* ===== UPGRADE CARD ===== */}
        <div className="mt-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1">
            <LuCrown className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
          </div>
          <p className="text-xs opacity-90 leading-relaxed">
            Team workspaces, smart automation & advanced analytics.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="mt-3 w-full bg-white text-gray-900 hover:bg-gray-100 py-1.5 rounded-lg text-xs font-semibold shadow transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

/* ---------------- COMPONENTS ---------------- */

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="mb-5">
    <p className="text-[11px] font-semibold uppercase tracking-wider text-(--color-desc) px-3 mb-2">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

interface ItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: string;
}

const Item = ({ icon, label, onClick, active, badge }: ItemProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
      active
        ? "bg-blue-600/15 text-blue-500 font-semibold"
        : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
        {badge}
      </span>
    )}
  </button>
);

const LockedItem = ({ label }: { label: string }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-(--color-desc) opacity-60 cursor-not-allowed text-sm">
    <div className="flex items-center gap-3">
      <LuUsers className="w-5 h-5" />
      <span>{label}</span>
    </div>
    <LuCrown className="text-amber-500 w-4 h-4" />
  </div>
);

