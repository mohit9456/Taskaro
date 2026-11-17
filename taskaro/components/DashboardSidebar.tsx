"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "../public/Logo3.png";
import ThemeToggle from "./ThemeToggle";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Flame,
  AlarmClock,
  BarChart3,
  Trash2,
  Crown,
  Menu,
  X,
  User,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavItemConfig {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const coreItems: NavItemConfig[] = [
  {
    key: "dashboard",
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    key: "my-tasks",
    label: "My Tasks",
    href: "/dashboard/my-tasks",
    icon: CheckSquare,
  },
  {
    key: "calendar",
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: Calendar,
  },
];

const routineItems: NavItemConfig[] = [
  {
    key: "habits",
    label: "Habits & Routine",
    href: "/dashboard/habits",
    icon: Flame,
    badge: "DAILY",
  },
  {
    key: "smart-alarm",
    label: "Smart Alarms",
    href: "/dashboard/smart-alarm",
    icon: AlarmClock,
  },
];

const insightsItems: NavItemConfig[] = [
  {
    key: "reports",
    label: "Analytics",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    key: "trash",
    label: "Trash",
    href: "/dashboard/trash",
    icon: Trash2,
  },
];

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <>
      {/* MOBILE TOP BAR (IN FLOW ON MOBILE, HIDDEN ON DESKTOP) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-(--card-bg) border-b border-(--color-border) shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--color-border)/80 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center">
            <Image
              src={logo}
              alt="Taskaro"
              className="w-28 h-auto dark:invert dark:brightness-110"
              priority
            />
          </Link>
        </div>
        <ThemeToggle />
      </div>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* PINNED SIDEBAR (DESKTOP) & SLIDE-OVER (MOBILE) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen w-64 shrink-0 bg-(--card-bg) border-r border-(--color-border) flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* TOP BRAND HEADER */}
        <div className="p-4 border-b border-(--color-border)">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
            >
              <Image
                src={logo}
                alt="Taskaro"
                className="w-32 h-auto dark:invert dark:brightness-110"
                priority
              />
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SCROLLABLE NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scroll-smooth">
          {/* CORE WORKSPACE */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
              Workspace
            </p>
            {coreItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.key === "dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 font-bold"
                      : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* DISCIPLINE & ROUTINE */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
              Discipline & Habits
            </p>
            {routineItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                      : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* INSIGHTS */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
              Analytics & System
            </p>
            {insightsItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-purple-600/15 text-purple-600 dark:text-purple-400 font-bold"
                      : "text-(--color-content) hover:bg-(--hover-card-bg) hover:text-(--color-text)"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* UPGRADE PRO CARD OR ACTIVE PRO BADGE */}
          {(session?.user as any)?.isPro ? (
            <div className="rounded-2xl bg-linear-to-br from-amber-500/15 via-purple-500/15 to-blue-500/15 border border-amber-500/30 p-3.5 text-(--color-text) shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>PRO MEMBER</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-(--color-desc) leading-tight">
                All cognitive alarms, habit matrices, and velocity analytics unlocked.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 p-3.5 text-white shadow-lg shadow-blue-500/15 space-y-2">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold tracking-tight">Taskaro Pro</span>
              </div>
              <p className="text-[11px] text-blue-100/90 leading-tight">
                Unlock unlimited habits, smart cloud alarms & AI task insights.
              </p>
              <button
                onClick={() => router.push("/pricing")}
                className="w-full py-1.5 rounded-xl bg-white text-gray-900 hover:bg-white/90 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="p-3 border-t border-(--color-border) bg-(--card-bg)">
          {session?.user ? (
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl hover:bg-(--hover-card-bg) transition-colors">
              <Link
                href="/dashboard/update-profile"
                className="flex items-center gap-2.5 min-w-0 flex-1"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-(--color-border)"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0">
                    {getUserInitials(session.user.name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-(--color-text) truncate">
                      {session.user.name}
                    </p>
                    {(session.user as any)?.isPro && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs tracking-wider shrink-0">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-(--color-desc) truncate">
                    {session.user.email}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-(--color-desc) hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold text-white bg-(--color-primary)"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
