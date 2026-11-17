import { Metadata } from "next";
import TeamContent from "./TeamContent";

export const metadata: Metadata = {
  title: "Team & Departments | Taskaro Pro Hub",
  description:
    "Organize your team into departments, appoint leads, delegate work, and scale with Taskaro Pro.",
};

export default function TeamPage() {
  return <TeamContent />;
}
