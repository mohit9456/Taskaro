import React from "react";
import DashboardContent from "../components/dashboard/DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Overview | Taskaro - Personal Productivity Hub",
  description:
    "Monitor your today's focus tasks, manage daily habit streaks, and track real-time productivity.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
