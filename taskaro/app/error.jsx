"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const ErrorPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
      <p className="text-text font-extrabold text-[36px] md:text-[72px]">
        500
      </p>

      <h1 className="text-content font-bold text-[20px] md:text-[24px] mt-1">
        SOMETHING WENT WRONG
      </h1>

      <div className="bg-(--color-text) h-px w-40 my-3"></div>

      <blockquote className="text-text font-normal text-sm md:text-base max-w-xl">
        An unexpected error occurred. Please try again, or return to the home
        page.
      </blockquote>

      <div className="flex gap-4 mt-6">

        <button
          onClick={() => router.refresh()}
          aria-label="go to home"
          className="border px-6 py-1 border-red-400 text-red-400 rounded-4xl text-sm md:text-base"
        >
          try again
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
