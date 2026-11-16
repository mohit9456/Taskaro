import React from "react";
import type { Metadata } from "next";
import Reports from "@/app/components/dashboard/Reports";

export const metadata: Metadata = {
  title: "Analytics & Intelligence | Taskaro",
  description: "Track execution velocity, on-time delivery rates, habit synergy, and workload analytics.",
};

export default function ReportsPage() {
  return (
    <div className="w-full">
      <Reports />
    </div>
  );
}
