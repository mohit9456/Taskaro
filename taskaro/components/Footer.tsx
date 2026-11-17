"use client";

import React, { useState } from "react";
import logoImg from "../public/Logo2.png";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  FaXTwitter,
  FaGithub,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa6";
import axios from "axios";

export default function Footer() {
  const pathname = usePathname();

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  // Hide marketing footer on dashboard views
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterStatus("error");
      setNewsletterMsg("Please enter a valid email address");
      return;
    }

    setNewsletterStatus("loading");
    setNewsletterMsg("");

    try {
      await axios.post("/api/subscribe-letter", { email: newsletterEmail });
      setNewsletterStatus("success");
      setNewsletterMsg("You're in! Welcome to our weekly productivity dispatch.");
      setNewsletterEmail("");
    } catch (err: any) {
      setNewsletterStatus("error");
      setNewsletterMsg(
        err?.response?.data?.message ||
        "Could not subscribe right now. Please try again later."
      );
    }
  };

  const productLinks = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Smart Alarm", href: "/dashboard/smart-alarm" },
    { label: "Habit Tracker", href: "/dashboard/habits" },
    { label: "Water Discipline", href: "/dashboard/water" },
    { label: "Gym Tracker", href: "/dashboard/gym" },
  ];

  const companyLinks = [
    { label: "About Us", href: "/about-us" },
    { label: "Clients & Partners", href: "/clients" },
    { label: "Contact Us", href: "/contact-us" },
    { label: "FAQ", href: "/faq" },
    { label: "Help & Support", href: "/help-support" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-conditions" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Legal Disclaimer", href: "/legal-disclaimer" },
  ];

  const socialLinks = [
    { name: "Twitter", icon: FaXTwitter, href: "https://x.com" },
    { name: "GitHub", icon: FaGithub, href: "https://github.com" },
    { name: "LinkedIn", icon: FaLinkedinIn, href: "https://linkedin.com" },
    { name: "Instagram", icon: FaInstagram, href: "https://instagram.com" },
    { name: "YouTube", icon: FaYoutube, href: "https://youtube.com" },
  ];

  return (
    <footer className="w-full bg-(--card-bg) border-t border-(--color-border) text-(--color-text) transition-colors duration-200">
      {/* MAIN FOOTER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-11 gap-10 lg:gap-8">
          {/* BRAND COLUMN (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src={logoImg}
                alt="Taskaro logo"
                className="w-36 h-auto invert dark:invert-0 brightness-110 dark:brightness-100" />
            </Link>
            <p className="text-sm text-(--color-desc) leading-relaxed max-w-sm">
              The high-performance productivity workspace. Master your daily
              tasks, build unbreakable habits, and synchronize discipline
              across body, mind, and work.
            </p>

            {/* LIVE STATUS PILL */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--hover-card-bg) border border-(--color-border) text-xs font-medium text-(--color-content)">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All systems operational</span>
            </div>

            {/* SOCIAL ICONS */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="p-2 rounded-xl bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) hover:bg-(--color-border) transition-all duration-150 active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* PRODUCT LINKS (2 cols) */}
          {/* <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              {productLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-(--color-desc) hover:text-(--color-primary) transition-colors flex items-center gap-1 group"
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* COMPANY LINKS (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-(--color-desc) hover:text-(--color-primary) transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL LINKS (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
              Legal & Trust
            </h3>
            <ul className="space-y-2 text-sm">
              {legalLinks.map((item, idx) => (
                <li key={idx}>
                  <Link
                    href={item.href}
                    className="text-(--color-desc) hover:text-(--color-primary) transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER (2 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-(--color-text)">
              Stay In Sync
            </h3>
            <p className="text-xs text-(--color-desc) leading-relaxed">
              Curated tactics for daily execution and discipline directly in
              your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                  }}
                  placeholder="Enter email"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) focus:outline-none focus:ring-2 focus:ring-(--color-primary)/50 transition-all pr-9"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-(--color-primary) text-white hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* INLINE STATUS MESSAGE (NO TOAST) */}
              {newsletterStatus === "success" && (
                <div className="flex items-start gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{newsletterMsg}</span>
                </div>
              )}
              {newsletterStatus === "error" && (
                <div className="flex items-start gap-1.5 text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{newsletterMsg}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* BOTTOM DIVIDER & COPYRIGHT */}
        <div className="border-t border-(--color-border) mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-(--color-desc)">
          <p>© {new Date().getFullYear()} Taskaro Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>SOC-2 & GDPR Aligned</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
