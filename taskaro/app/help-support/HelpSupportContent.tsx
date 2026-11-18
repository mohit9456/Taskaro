"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  CreditCard,
  KeyRound,
  AlarmClock,
  Users2,
  ExternalLink,
} from "lucide-react";

interface FAQItem {
  category: "alarms" | "billing" | "teams" | "account";
  question: string;
  answer: string;
}

export default function HelpSupportContent() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const supportChannels = [
    {
      icon: Mail,
      color: "from-blue-500 to-indigo-600",
      title: "Email Support Desk",
      contact: "support@taskaro.com",
      link: "mailto:support@taskaro.com",
      sla: "Guaranteed reply: < 4h for Pro, < 24h for Free",
      actionText: "Send Support Email",
    },
    {
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-600",
      title: "Real-time Team Chat & Huddles",
      contact: "In-app Resolver Rooms",
      link: "/dashboard/team/chat",
      sla: "Instant async collaboration with your leads",
      actionText: "Open Team Chat",
    },
    {
      icon: BookOpen,
      color: "from-purple-500 to-pink-600",
      title: "Knowledge Base & FAQ",
      contact: "Comprehensive Guides",
      link: "/faq",
      sla: "Step-by-step feature tutorials & API docs",
      actionText: "Browse FAQ Center",
    },
  ];

  const faqs: FAQItem[] = [
    {
      category: "alarms",
      question: "Why does my Smart Alarm not play sound in background tabs on Chrome?",
      answer:
        "Modern browsers (Chrome, Edge, Safari) aggressively throttle background JavaScript timers and block automatic audio playback until the user has interacted with the page. To ensure 100% reliable alarms: (1) Ensure Taskaro tab is kept open or pinned, (2) Allow Audio Autoplay permissions in your browser address bar settings, and (3) Ensure system volume / do-not-disturb is turned off.",
    },
    {
      category: "billing",
      question: "How do I upgrade to Taskaro Pro with Razorpay?",
      answer:
        "Navigate to our Pricing page (/pricing) or click 'Upgrade Now' in your Dashboard Sidebar. Select Monthly or Yearly billing (18% savings), and complete payment securely via Razorpay (UPI, Credit/Debit Cards, NetBanking). Your account is instantly upgraded to Pro upon signature verification.",
    },
    {
      category: "billing",
      question: "Can I cancel my subscription or request a refund?",
      answer:
        "Yes! We offer a no-questions-asked 7-Day Money-Back Guarantee on all first-time Pro subscriptions. You can cancel your subscription at any time from your billing settings or by contacting support@taskaro.com.",
    },
    {
      category: "teams",
      question: "How does the Cross-Department Query Desk & SLA timer work?",
      answer:
        "Any team member can raise a Query or Blocker Ticket to another department (e.g. Frontend to Backend). Urgent Blockers automatically calculate a 4-hour SLA deadline. If the SLA expires without resolution, our system triggers an automated 'Blocker Pulse' directly on the Department Lead's dashboard.",
    },
    {
      category: "teams",
      question: "What is the 60-Second Async Daily Standup?",
      answer:
        "Instead of 30-minute Zoom morning calls, team members log their 1-3 primary focus tasks, any active cross-department blockers, committed hours, and an energy score in 60 seconds. Department Leads can inspect the live Department Readiness Radar anytime.",
    },
    {
      category: "account",
      question: "How do I update my profile details, password, or profile photo?",
      answer:
        "Go to your Dashboard and click on your profile at the bottom of the sidebar, or visit /dashboard/update-profile. You can update your display name, about bio, phone number, password, and upload a custom avatar.",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      search.trim() === "" ||
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO & SEARCH */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-20 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Customer Success & Helpdesk</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              How Can We Help You <br />
              <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Execute With Clarity Today?
              </span>
            </h1>

            <p className="text-sm sm:text-base text-(--color-desc) leading-relaxed">
              Find instant answers to common questions, explore technical troubleshooting guides, or reach our engineering support team directly.
            </p>

            {/* LIVE SEARCH INPUT */}
            <div className="max-w-xl mx-auto relative pt-2">
              <Search className="w-4 h-4 text-(--color-desc) absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search troubleshooting guides, alarms, billing, or teams..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-(--card-bg) border border-(--color-border) text-xs sm:text-sm text-(--color-text) placeholder:text-(--color-desc) focus:outline-hidden focus:ring-2 focus:ring-(--color-primary)/50 shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE SUPPORT CHANNELS */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((ch, idx) => {
            const Icon = ch.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-7 flex flex-col justify-between space-y-5 shadow-xs hover:border-(--color-primary)/50 transition-all"
              >
                <div className="space-y-3">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${ch.color} text-white flex items-center justify-center shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-(--color-text)">
                    {ch.title}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-(--color-primary)">
                    {ch.contact}
                  </p>
                  <p className="text-xs text-(--color-desc) leading-relaxed">
                    {ch.sla}
                  </p>
                </div>

                <Link
                  href={ch.link}
                  className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-xs font-bold text-(--color-text) transition-colors"
                >
                  <span>{ch.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CATEGORY FILTER TABS & TROUBLESHOOTING ACCORDION */}
      <section className="pb-16 sm:pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-xl sm:text-3xl font-extrabold text-(--color-text)">
            Frequently Resolved Issues
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Select a topic below for instant step-by-step resolution.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { id: "all", label: "All Topics" },
              { id: "alarms", label: "Smart Alarms" },
              { id: "billing", label: "Billing & Pro" },
              { id: "teams", label: "Teams & SLAs" },
              { id: "account", label: "Account & Login" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-(--color-primary) text-white shadow-xs"
                    : "bg-(--card-bg) border border-(--color-border) text-(--color-desc) hover:text-(--color-text)"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-(--card-bg) border border-(--color-border) text-xs text-(--color-desc)">
              No matching troubleshooting guides found. Please email us directly at support@taskaro.com.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-(--card-bg) border border-(--color-border) overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-(--hover-card-bg)/40 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-(--color-text)">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-(--color-desc) shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-(--color-primary)" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-(--color-desc) leading-relaxed border-t border-(--color-border)/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 4. SYSTEM HEALTH STATUS & CONTACT CTA */}
      <section className="py-12 bg-(--card-bg) border-t border-(--color-border)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>All Core Taskaro Cloud Systems Operational</span>
          </div>

          <h3 className="text-lg sm:text-2xl font-bold text-(--color-text)">
            Still Need Personalized Assistance?
          </h3>

          <p className="text-xs sm:text-sm text-(--color-desc) max-w-lg mx-auto">
            Our dedicated team is on standby to help you setup your team departments, configure custom alarms, or resolve billing inquiries.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/contact-us"
              className="px-5 py-2.5 rounded-xl bg-(--color-primary) text-white text-xs font-bold hover:opacity-90 shadow-xs"
            >
              Contact Support Form
            </Link>
            <a
              href="mailto:support@taskaro.com"
              className="px-5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) text-xs font-bold hover:border-(--color-primary)"
            >
              Email Directly
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
