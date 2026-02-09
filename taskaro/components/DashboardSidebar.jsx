"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { HiChartBar, HiCheckBadge, HiOutlineArchiveBox } from "react-icons/hi2";
import {
  LuBell,
  LuCalendar,
  LuCrown,
  LuLayoutDashboard,
  LuMenu,
  LuPlus,
  LuUsers,
  LuX,
} from "react-icons/lu";

const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [openLock, setOpenLock] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState(""); // Active page state

  useEffect(() => {
    if (pathname === "/dashboard") {
      setActivePage("dashboard");
    } else {
      const key = pathname.split("/").filter(Boolean)[1];
      if (key) {
        setActivePage(key);
      }
    }
  }, []);

  const handleLockedClick = (key) => {
    setOpenLock(openLock === key ? null : key);
  };

  const handleClick = (key) => {
    setActivePage(key);
    setSidebarOpen(false);
    if (key === "dashboard") {
      router.push(`/${key}`);
    } else {
      router.push(`/dashboard/${key}`);
    }
  };

  return (
    <div>
      {/* MOBILE SIDEBAR TOGGLE */}
      <div className="md:hidden fixed top-26 right-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-(--color-bg) p-2 rounded-lg shadow"
        >
          {sidebarOpen ? (
            <LuX size={20} color="var(--color-desc)" />
          ) : (
            <LuMenu size={20} color="var(--color-desc)" />
          )}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`w-64 h-screen bg-(--color-bg) border-r px-4 py-6 
  fixed md:relative z-40 transform
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 transition-transform duration-300 
  md:block overflow-y-auto`}
      >
        <h2 className="text-2xl font-bold mb-8">Taskaro</h2>

        <nav className="space-y-2">
          <SidebarItem
            icon={<LuLayoutDashboard />}
            label="Dashboard"
            active={activePage === "dashboard"}
            onClick={() => handleClick("dashboard")}
          />
          <SidebarItem
            icon={<HiCheckBadge />}
            label="My Tasks"
            active={activePage === "my-tasks"}
            onClick={() => handleClick("my-tasks")}
          />
          <SidebarItem
            icon={<LuPlus />}
            label="Create Task"
            active={activePage === "create-task"}
            onClick={() => handleClick("create-task")}
          />
          <SidebarItem
            icon={<LuCalendar />}
            label="Calendar"
            active={activePage === "calendar"}
            onClick={() => handleClick("calendar")}
          />
          <SidebarItem
            icon={<HiChartBar />}
            label="Reports"
            active={activePage === "reports"}
            onClick={() => handleClick("reports")}
          />
          {/* <SidebarItem
            icon={<LuSettings />}
            label="Settings"
            active={activePage === "settings"}
            onClick={() => setActivePage("settings")}
          /> */}
          <SidebarItem
            icon={<LuBell />}
            label="Notifications"
            active={activePage === "notification"}
            onClick={() => handleClick("notification")}
          />
          <SidebarItem
            icon={<HiOutlineArchiveBox />}
            label="Trash"
            active={activePage === "trash"}
            onClick={() => handleClick("trash")}
          />

          <LockedItem
            label="Team"
            open={openLock === "team"}
            onClick={() => handleLockedClick("team")}
            router={router}
          />

          <LockedItem
            label="Invite Members"
            open={openLock === "invite"}
            onClick={() => handleLockedClick("invite")}
            router={router}
          />
        </nav>

        {/* UPGRADE CARD */}
        <div className="mt-10 rounded-xl bg-linear-to-br from-yellow-400 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <LuCrown size={18} />
            <h3 className="font-semibold">Upgrade to Pro</h3>
          </div>
          <p className="text-sm opacity-90">
            Unlock team collaboration & advanced features.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="mt-3 w-full bg-white text-black py-2 rounded-lg text-sm font-medium cursor-pointer"
          >
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardSidebar;

/* ------------------ COMPONENTS ------------------ */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${
        active
          ? "bg-blue-100 text-blue-600"
          : "hover:bg-gray-100 dark:hover:bg-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

function LockedItem({ label, open, onClick, router }) {
  return (
    <div>
      <div
        onClick={onClick}
        className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 text-gray-400 dark:text-gray-600"
      >
        <div className="flex items-center gap-3">
          <LuUsers />
          <span>{label}</span>
        </div>
        <LuCrown size={16} className="text-yellow-500" />
      </div>

      {open && (
        <div className="ml-10 mt-2 rounded-lg border bg-yellow-50 dark:bg-yellow-200 p-3">
          <p className="text-sm text-yellow-800 dark:text-yellow-900">
            This feature is available on Pro plan.
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="mt-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer"
          >
            Upgrade Now →
          </button>
        </div>
      )}
    </div>
  );
}
