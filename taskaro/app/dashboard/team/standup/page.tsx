import { Metadata } from "next";
import StandupContent from "./StandupContent";

export const metadata: Metadata = {
  title: "60-Second Async Daily Standup | Taskaro Pro Hub",
  description:
    "Zero-meeting async daily standup, morning pulse tracking, and department readiness radar in Taskaro.",
};

export default function StandupPage() {
  return <StandupContent />;
}
