import { Metadata } from "next";
import TeamChatContent from "./TeamChatContent";

export const metadata: Metadata = {
  title: "Team Discussions & Channels | Taskaro Pro Hub",
  description:
    "Real-time departmental discussions, 1-on-1 team direct messages, and ticket resolution rooms.",
};

export default function TeamChatPage() {
  return <TeamChatContent />;
}
