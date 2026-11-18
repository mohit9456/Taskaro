import { Metadata } from "next";
import { Suspense } from "react";
import TeamChatContent from "./TeamChatContent";

export const metadata: Metadata = {
  title: "Team Discussions & Channels | Taskaro Pro Hub",
  description:
    "Real-time departmental discussions, 1-on-1 team direct messages, and ticket resolution rooms.",
};

export default function TeamChatPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <TeamChatContent />
    </Suspense>
  );
}