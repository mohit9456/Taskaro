import React from "react";
import CalendarSection from "@/app/components/dashboard/Calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar & Schedule | Taskaro",
  description: "View and manage your tasks, upcoming deadlines, and daily schedules on the visual interactive calendar.",
};

export default function CalendarPage() {
  return (
    <div className="w-full">
      <CalendarSection />
    </div>
  );
}
