"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./provider/ThemeProvider";
import { LuMoon, LuSun } from "react-icons/lu";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-(--border-color) bg-(--card-bg) ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className={`flex items-center gap-2 p-2 rounded-lg border border-(--border-color) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition-colors cursor-pointer ${className}`}
    >
      {isDark ? (
        <LuSun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <LuMoon className="w-5 h-5 text-indigo-500 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

