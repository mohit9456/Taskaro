"use client";

import { useRouter } from "next/navigation";
import React from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-(--color-bg) text-(--color-text)">
      <p className="font-extrabold text-[48px] md:text-[72px] text-red-500">
        500
      </p>

      <h1 className="font-bold text-[20px] md:text-[24px] mt-1 text-(--color-text)">
        SOMETHING WENT WRONG
      </h1>

      <div className="bg-(--color-border) h-px w-40 my-4"></div>

      <p className="text-sm md:text-base max-w-xl text-(--color-desc)">
        {error?.message || "An unexpected error occurred. Please try again, or return to the home page."}
      </p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => reset ? reset() : router.refresh()}
          aria-label="Try again"
          className="border border-red-500 text-red-500 hover:bg-red-500/10 px-6 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

