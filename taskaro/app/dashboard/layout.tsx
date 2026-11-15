import React from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Taskaro - Productivity & Task Command Center",
  description:
    "Manage your daily tasks, build unbreakable habits, and synchronize discipline across your work.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full max-w-full overflow-hidden flex flex-col md:flex-row bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* FIXED PINNED SIDEBAR (LEFT) + MOBILE TOP BAR */}
      <DashboardSidebar />

      {/* INDEPENDENT RIGHT-SIDE SCROLLABLE WORKSPACE */}
      <div className="flex-1 h-full min-h-0 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden scroll-smooth p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
