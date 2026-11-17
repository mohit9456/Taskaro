import React from "react";
import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing Plans & Pro Membership | Taskaro",
  description:
    "Explore Taskaro plans. Start free forever or upgrade to Taskaro Pro for unlimited smart alarms, cognitive wake-up puzzles, habit matrices, and 1-year analytics.",
  openGraph: {
    title: "Taskaro Pricing - Simple, Transparent Productivity Plans",
    description:
      "Unlock peak discipline with Taskaro Pro. Unlimited tasks, smart alarms, anti-snooze challenges, and deep velocity analytics.",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
