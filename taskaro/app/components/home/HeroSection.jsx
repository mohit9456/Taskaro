"use client";

import React, { useState } from "react";
import img_heroSection from "../../../public/taskaro_heroSection.png";
import Image from "next/image";
import RotatingText from "@/components/RotatingText";
import toast from "react-hot-toast";
import { Api } from "@/lib/api";

const HeroSection = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    Api.post("/subscribe-letter", { email })
      .then(({ data }) => {
        toast.success(data?.message || "success");
        setEmail("");
      })
      .catch((error) => {
        toast.error(
          error?.response?.data.error ||
            "Something went wrong ! try again later"
        );
      });
  };

  return (
    <section className="relative py-12 bg-black sm:pb-16 lg:pb-20 xl:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid items-center grid-cols-1 gap-y-12 lg:grid-cols-2 gap-x-16">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl font-medium text-[#fff] sm:text-5xl lg:text-6xl xl:text-7xl">
              Streamline Your Tasks with
              <RotatingText
                texts={["Taskaro", "Productivity", "Precision", "Confidence"]}
                mainClassName="text-[#fff] overflow-hidden"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </h1>
            <p className="mt-4 text-lg font-normal text-gray-400 sm:mt-8">
              Taskaro helps individuals and teams organize, prioritize, and
              track tasks efficiently—so you can focus on getting things done,
              not managing them.
            </p>

            <div className="relative mt-8 rounded-full sm:mt-12">
              <div className="relative">
                <div className="absolute rounded-full -inset-px bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-6">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="search"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="block w-full py-4 pr-6 text-white placeholder-gray-500 bg-black border border-transparent rounded-full pl-14 sm:py-5 focus:outline-none focus:ring-0"
                  />
                </div>
              </div>
              <div className="sm:absolute sm:right-1.5 sm:inset-y-1.5 my-[5px]">
                <button
                  onClick={handleSubmit}
                  type="submit"
                  className="inline-flex items-center justify-center w-full px-5 py-5 text-sm font-semibold tracking-widest text-black uppercase bg-white rounded-full sm:w-auto sm:py-3 hover:opacity-90 transition"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <div className="mt-8 sm:mt-12">
              <p className="text-lg font-normal text-white">
                Trusted by 10,000+ users
              </p>
              <div className="flex items-center mt-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .587l3.668 7.568L24 9.423l-6 5.88L19.335 24 12 20.112 4.665 24 6 15.303 0 9.423l8.332-1.268z" />
                  </svg>
                ))}
                <span className="ml-2 text-base font-normal text-white">
                  5.0/5 (10k+ reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <svg
              className="blur-3xl filter opacity-70 absolute inset-0"
              width="444"
              height="536"
              viewBox="0 0 444 536"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M225.9 112.7C343.9 64.6 389.3 -70.4 437.4 47.5C485.5 165.6 253.3 481.4 135.2 529.4C17.1 577.5 57.9 339.7 9.9 221.6C-38.1 103.5 107.9 160.8 225.9 112.7Z"
                fill="url(#c)"
              />
              <defs>
                <linearGradient
                  id="c"
                  x1="82.73"
                  y1="550.79"
                  x2="-39.94"
                  y2="118.97"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="cyan" />
                  <stop offset="100%" stopColor="purple" />
                </linearGradient>
              </defs>
            </svg>
            <Image
              className="relative w-full max-w-md mx-auto"
              src={img_heroSection}
              alt="Taskaro dashboard overview"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
