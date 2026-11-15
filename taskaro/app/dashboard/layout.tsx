import React from "react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      <DashboardSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

