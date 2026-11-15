"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import logo from "../public/Logo3.png";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { CgProfile } from "react-icons/cg";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  id: number;
  name: string;
  url: string;
}

const headerData: NavItem[] = [
  { id: 1, name: "Home", url: "/" },
  { id: 2, name: "Clients", url: "/clients" },
  { id: 3, name: "Features", url: "/features" },
  { id: 4, name: "Pricing", url: "/pricing" },
  { id: 5, name: "Contact", url: "/contact-us" },
];

export default function Navbar() {
  const [navbarClose, setNavbarClose] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  return (
    <header className="flex backdrop-blur-md sticky top-0 bg-(--card-bg)/90 border-b border-(--color-border) items-center py-3 justify-between px-4 md:px-10 z-50 transition-colors">
      <nav className="w-full">
        <div className="flex justify-between items-center mx-auto max-w-screen">
          <Link href="/" className="flex w-fit items-center">
            <Image
              src={logo}
              alt="Taskaro Logo"
              className="w-36 md:w-44 dark:invert dark:brightness-0"
              priority
            />
          </Link>
          <div className="flex items-center lg:order-2 gap-2">
            <ThemeToggle />
            <div className="flex items-center justify-center relative">
              {session ? (
                <div
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                  className="relative"
                >
                  <button className="bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hidden md:flex items-center gap-1.5 font-medium rounded-lg text-sm px-3.5 py-2 mr-2 cursor-pointer transition-colors">
                    <CgProfile className="w-4 h-4 text-(--color-primary)" />
                    <span>{session.user?.name}</span>
                  </button>
                  <CgProfile
                    className="md:hidden mr-2 cursor-pointer text-(--color-content)"
                    size={24}
                  />
                  {profileHover && (
                    <div className="absolute top-full right-0 w-44 rounded-xl flex flex-col items-start p-2 bg-(--card-bg) border border-(--color-border) shadow-xl z-50 space-y-1">
                      <Link
                        href="/dashboard"
                        className="w-full text-left px-3 py-1.5 rounded-lg text-(--color-text) hover:bg-(--hover-card-bg) text-sm font-medium transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/update-profile"
                        className="w-full text-left px-3 py-1.5 rounded-lg text-(--color-text) hover:bg-(--hover-card-bg) text-sm font-medium transition-colors"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors cursor-pointer"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) hidden md:block font-medium rounded-lg text-sm px-4 py-2 mr-2 transition-colors"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/join"
                className="text-white bg-(--color-primary) hover:bg-blue-600 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors shadow-xs"
              >
                Join Now
              </Link>
            </div>
            <button
              onClick={() => setNavbarClose(true)}
              data-collapse-toggle="mobile-menu-2"
              type="button"
              className="inline-flex items-center p-2 text-sm text-(--color-desc) rounded-lg lg:hidden hover:bg-(--hover-card-bg)"
              aria-controls="mobile-menu-2"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div
            className={`transition-all duration-300 ease-in-out transform ${
              navbarClose ? "translate-x-0" : "-translate-x-full"
            } lg:hidden fixed top-0 left-0 w-full h-screen bg-(--card-bg) flex flex-col px-5 pt-5 gap-5 z-50`}
          >
            <div className="flex w-full justify-between items-center px-4 py-2">
              <Link href="/" className="flex w-fit items-center">
                <Image
                  src={logo}
                  alt="Taskaro Logo"
                  className="w-36 dark:invert dark:brightness-0"
                />
              </Link>
              <ImCross
                onClick={() => setNavbarClose(false)}
                size={18}
                className="cursor-pointer text-(--color-content)"
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-2 w-full">
              <div className="px-4 py-2 w-full">
                <ThemeToggle showLabel className="w-full justify-between" />
              </div>
              {headerData.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setNavbarClose(false)}
                  className="text-sm flex w-full justify-between items-center px-4 py-2.5 rounded-lg hover:bg-(--hover-card-bg) text-(--color-text) transition-colors"
                >
                  <p className="font-medium">{item.name}</p>
                  <FaArrowRight className="text-(--color-desc)" />
                </Link>
              ))}
            </div>
            {!session && (
              <div className="flex w-full justify-between items-center px-4 py-2 gap-2 mt-2">
                <Link
                  href="/auth/login"
                  onClick={() => setNavbarClose(false)}
                  className="bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) font-semibold rounded-lg text-sm py-2.5 w-1/2 text-center"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setNavbarClose(false)}
                  className="bg-(--color-primary) text-white font-semibold rounded-lg text-sm py-2.5 w-1/2 text-center"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div
            className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0 text-sm">
              {headerData.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url}
                    className="block py-2 pr-4 pl-3 text-(--color-content) hover:text-(--color-primary) transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

