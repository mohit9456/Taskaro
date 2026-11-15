import { Suspense } from "react";
import ResetClient from "./ResetClient";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center text-text">Loading...</div>}
    >
      <ResetClient />
    </Suspense>
  );
}
