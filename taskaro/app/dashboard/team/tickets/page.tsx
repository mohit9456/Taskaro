import { Metadata } from "next";
import TicketsContent from "./TicketsContent";

export const metadata: Metadata = {
  title: "Cross-Department Queries & Tickets | Taskaro Pro Hub",
  description:
    "Raise blocker queries, track SLA countdowns, and collaborate cross-departmentally in Taskaro.",
};

export default function TicketsPage() {
  return <TicketsContent />;
}
