import React from "react";
import MyTasksContent from "@/app/components/dashboard/MyTasksContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks Workspace | Taskaro",
  description:
    "Organize, prioritize, and execute your tasks with filters, priority tags, and due dates.",
};

export default function MyTasksPage() {
  return <MyTasksContent />;
}
