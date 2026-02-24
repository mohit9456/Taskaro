"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import{FaCheckSquare} from "react-icons/fa";
import{MdStackedBarChart} from "react-icons/md";
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

const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    if (pathname === "/dashboard") setActive("dashboard");
    else setActive(pathname.split("/")[2]);
  }, [pathname]);

  const go = (key) => {
    setActive(key);
    setSidebarOpen(false);
    key === "dashboard"
      ? router.push("/dashboard")
      : router.push(`/dashboard/${key}`);
  };

  return (
    <>
      {/* MOBILE TOGGLE */}
      <div className="md:hidden fixed top-24 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-(--color-bg) shadow"
        >
          {sidebarOpen ? <LuX size={20} /> : <LuMenu size={20} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed md:relative z-40 h-screen w-64 bg-(--color-bg) border-r px-4 py-6
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 overflow-y-auto`}
      >
        {/* LOGO */}
        <h1 className="text-2xl font-bold mb-8">Taskaro</h1>

        {/* ===== CORE ===== */}
        <Section title="Core">
          <Item icon={<LuLayoutDashboard />} label="Dashboard" active={active==="dashboard"} onClick={()=>go("dashboard")} />
          <Item icon={<FaCheckSquare />} label="My Tasks" active={active==="my-tasks"} onClick={()=>go("my-tasks")} />
          <Item icon={<LuPlus />} label="Create Task" active={active==="create-task"} onClick={()=>go("create-task")} />
          <Item icon={<LuCalendar />} label="Calendar" active={active==="calendar"} onClick={()=>go("calendar")} />
        </Section>

        {/* ===== LIFE TOOLS ===== */}
        <Section title="Life Tools">
          <Item icon={<LuAlarmClock />} label="Smart Alarms" badge="NEW" active={active==="alarms"} onClick={()=>go("smart-alarm")} />
          <Item icon={<LuDumbbell />} label="Gym Tracker" badge="🔥" active={active==="gym"} onClick={()=>go("gym")} />
          <Item icon={<LuDroplets />} label="Water Tracker" active={active==="water"} onClick={()=>go("water")} />
          <Item icon={<LuRepeat />} label="Habits" active={active==="habits"} onClick={()=>go("habits")} />
        </Section>

        {/* ===== INSIGHTS ===== */}
        <Section title="Insights">
          <Item icon={<MdStackedBarChart />} label="Reports" active={active==="reports"} onClick={()=>go("reports")} />
          <Item icon={<LuBell />} label="Notifications" active={active==="notification"} onClick={()=>go("notification")} />
          <Item icon={<LuTrash2 />} label="Trash" active={active==="trash"} onClick={()=>go("trash")} />
        </Section>

        {/* ===== PRO ===== */}
        <Section title="Team (Pro)">
          <LockedItem label="Team Workspace" />
          <LockedItem label="Invite Members" />
        </Section>

        {/* ===== UPGRADE CARD ===== */}
        <div className="mt-10 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <LuCrown />
            <h3 className="font-semibold">Upgrade to Pro</h3>
          </div>
          <p className="text-sm opacity-90">
            Advanced analytics, team features & smart reminders.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="mt-3 w-full bg-white text-black py-2 rounded-lg text-sm font-medium"
          >
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardSidebar;

/* ---------------- COMPONENTS ---------------- */

const Section = ({ title, children }) => (
  <div className="mb-6">
    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

const Item = ({ icon, label, onClick, active, badge }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
    ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-900"}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge && (
      <span className="text-xs px-2 py-0.5 rounded bg-blue-500 text-white">
        {badge}
      </span>
    )}
  </div>
);

const LockedItem = ({ label }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-400 cursor-not-allowed">
    <div className="flex items-center gap-3">
      <LuUsers />
      <span>{label}</span>
    </div>
    <LuCrown className="text-yellow-500" />
  </div>
);
