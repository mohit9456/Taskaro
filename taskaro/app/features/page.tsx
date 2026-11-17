import React from "react";
import type { Metadata } from "next";
import FeaturesContent from "./FeaturesContent";

export const metadata: Metadata = {
  title: "Features & Capabilities | Taskaro - Smart Task & Productivity Suite",
  description:
    "Explore Taskaro's comprehensive features: High-velocity Task Command Center, Smart Alarms with cognitive puzzles, Habit Streak Architecture, and Deep Execution Analytics.",
  openGraph: {
    title: "Taskaro Features - Prioritized Tasks, Smart Alarms & Habits",
    description:
      "A modern SaaS productivity suite designed for high performers. Synchronize tasks, routines, alarms, and analytics seamlessly.",
  },
};

export default function FeaturesPage() {
  return <FeaturesContent />;
}
