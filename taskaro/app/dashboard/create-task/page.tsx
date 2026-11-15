import React, { Suspense } from "react";
import CreateTask from "@/app/components/dashboard/CreateTask";
import { Metadata } from "next";
import Loader from "@/components/Loader";

export const metadata: Metadata = {
  title: "Create Task | Taskaro",
  description: "Create and schedule a new task in your Taskaro workspace.",
};

export default function CreateTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader />
        </div>
      }
    >
      <CreateTask />
    </Suspense>
  );
}
