import { Metadata } from "next";
import JoinTeamContent from "./JoinTeamContent";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Join Team Workspace | Taskaro Invitation",
  description:
    "Accept your invitation to collaborate in a high-performance Taskaro organization workspace.",
};

export default function JoinTeamPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <JoinTeamContent />
    </Suspense>
  );
}
