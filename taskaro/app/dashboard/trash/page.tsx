import React from "react";
import Trash from "@/app/components/dashboard/Trash";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trash | Taskaro",
  description: "View and restore deleted tasks in Taskaro.",
};

export default function TrashPage() {
  return (
    <div className="w-full">
      <Trash />
    </div>
  );
}
