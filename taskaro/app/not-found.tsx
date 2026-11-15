import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 text-center bg-(--color-bg) text-(--color-text)">
      <p className="font-extrabold text-[48px] md:text-[72px] text-blue-500">
        404
      </p>
      <h1 className="font-bold text-[20px] md:text-[24px] text-(--color-text)">
        PAGE NOT FOUND
      </h1>
      <div className="bg-(--color-border) h-px w-40 my-4"></div>
      <p className="text-sm md:text-base max-w-md text-(--color-desc) leading-relaxed">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center px-6 py-2 rounded-full border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-colors text-sm font-medium"
      >
        Take Me Home
      </Link>
    </div>
  );
}

