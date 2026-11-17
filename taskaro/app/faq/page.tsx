import React from "react";
import type { Metadata } from "next";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Taskaro - Knowledge Base",
  description:
    "Find answers to frequently asked questions about Taskaro tasks, smart alarms, cognitive wake-up challenges, habit streaks, and security.",
  openGraph: {
    title: "Taskaro FAQ - Everything You Need to Know",
    description:
      "Got questions about Taskaro? Browse our knowledge base covering tasks, alarms, habit tracking, and analytics.",
  },
};

export default function FAQPage() {
  return <FAQContent />;
}
