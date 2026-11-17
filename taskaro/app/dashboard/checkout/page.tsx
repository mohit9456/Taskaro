"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/pricing");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-xs text-(--color-desc)">
      Redirecting to Taskaro Pricing & Plan Activation...
    </div>
  );
}
