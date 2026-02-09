import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <p className="text-text font-extrabold text-[36px] md:text-[72px]">404</p>
      <h1 className="text-content font-bold text-[20px] md:text-[24px]">
        PAGE NOT FOUND
      </h1>
      <div className="bg-(--color-text) h-px w-40 my-3"></div>
      <blockquote className="text-text font-normal text-sm md:text-base">
        But if you don't change your direction, and if you keep looking, you may
        end up where you are heading.
      </blockquote>
      <div className="text-text font-normal mt-4 text-sm md:text-base border px-6 py-1 border-red-400 text-red-400 rounded-4xl">
        <Link href="/" aria-label="go to home">
          Take me home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
