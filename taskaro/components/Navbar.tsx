"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import logo from "../public/Logo3.png";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  CheckSquare,
  User,
  LogOut,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  id: number;
  name: string;
  url: string;
}

const navItems: NavItem[] = [
  { id: 1, name: "Home", url: "/" },
  { id: 2, name: "Features", url: "/features" },
  { id: 3, name: "Pricing", url: "/pricing" },
  { id: 4, name: "Clients", url: "/clients" },
  { id: 5, name: "Contact", url: "/contact-us" },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session, status } = useSession();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-(--card-bg)/80 border-b border-(--color-border)/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="relative">
              <Image
                src={logo}
                alt="Taskaro Logo"
                className="w-32 sm:w-36 md:w-40 h-auto dark:invert dark:brightness-110 transition-all duration-200"
                priority
              />
            </div>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-(--color-primary) bg-(--hover-card-bg) shadow-xs"
                      : "text-(--color-content) hover:text-(--color-text) hover:bg-(--hover-card-bg)/60"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-(--color-primary) rounded-full -mb-1" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2.5">
            {/* THEME TOGGLE */}
            <ThemeToggle />

            {/* AUTH STATE */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-(--hover-card-bg) animate-pulse hidden sm:block" />
            ) : session?.user ? (
              /* LOGGED IN DROPDOWN */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) transition-all duration-150 cursor-pointer shadow-xs"
                  aria-expanded={profileDropdownOpen}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-(--color-border)"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center ring-1 ring-white/20">
                      {getUserInitials(session.user.name)}
                    </div>
                  )}
                  <span className="hidden sm:inline-block text-xs font-semibold text-(--color-text) max-w-[120px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-(--color-desc) transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* PROFILE DROPDOWN MENU */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xl shadow-black/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-(--color-border)">
                      <p className="text-xs font-semibold text-(--color-text) truncate">
                        {session.user.name}
                      </p>
                      <p className="text-[11px] text-(--color-desc) truncate mt-0.5">
                        {session.user.email}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-(--color-primary)" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/my-tasks"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-colors"
                      >
                        <CheckSquare className="w-4 h-4 text-emerald-500" />
                        My Tasks
                      </Link>
                      <Link
                        href="/dashboard/update-profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-500" />
                        Edit Profile
                      </Link>
                    </div>

                    <div className="border-t border-(--color-border) p-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* LOGGED OUT ACTIONS */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-full text-xs font-medium text-(--color-text) hover:bg-(--hover-card-bg) transition-all duration-150"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-150 active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* MOBILE HAMBURGER BUTTON */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-xl text-(--color-content) hover:text-(--color-text) hover:bg-(--hover-card-bg) border border-(--color-border) transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER / OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-(--card-bg)/95 backdrop-blur-2xl border-b border-(--color-border) shadow-2xl px-5 py-6 space-y-5 animate-in slide-in-from-top-4 duration-200 z-50">
          {/* USER INFO IF LOGGED IN */}
          {session?.user && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-(--hover-card-bg) border border-(--color-border)">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-(--color-border)"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center">
                  {getUserInitials(session.user.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--color-text) truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-(--color-desc) truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          )}

          {/* MOBILE NAV LINKS */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-(--color-primary) bg-(--hover-card-bg) font-semibold"
                      : "text-(--color-content) hover:text-(--color-text) hover:bg-(--hover-card-bg)/60"
                  }`}
                >
                  <span>{item.name}</span>
                  <ArrowRight className="w-4 h-4 opacity-40" />
                </Link>
              );
            })}
          </nav>

          {/* QUICK DASHBOARD / PROFILE FOR MOBILE */}
          {session?.user ? (
            <div className="pt-2 border-t border-(--color-border) space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-(--color-text) hover:bg-(--hover-card-bg)"
              >
                <LayoutDashboard className="w-4 h-4 text-(--color-primary)" />
                <span>Go to Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          ) : (
            /* MOBILE AUTH BUTTONS */
            <div className="pt-2 border-t border-(--color-border) flex flex-col gap-2.5">
              <Link
                href="/auth/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started Free</span>
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-medium text-(--color-text) bg-(--hover-card-bg) border border-(--color-border)"
              >
                Log in to Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
