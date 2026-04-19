import React, { Suspense } from "react";
import CreateTask from "@/app/components/dashboard/CreateTask";

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateTask />
    </Suspense>
  );
};

export default page;
