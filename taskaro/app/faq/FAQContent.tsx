"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  BellRing,
  Flame,
  CheckSquare,
  Shield,
  Layers,
} from "lucide-react";

interface FAQItem {
  id: number;
  category: "tasks" | "alarms" | "habits" | "security" | "billing";
  categoryLabel: string;
  que: string;
  ans: string;
}

export default function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIds, setOpenIds] = useState<number[]>([1, 2]);

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: "tasks",
      categoryLabel: "Task Management",
      que: "How does Taskaro's priority triage work?",
      ans: "Taskaro categorizes tasks into High, Medium, and Low priorities. High-priority tasks are highlighted on your dashboard with immediate visibility, overdue counters, and weighted scoring inside your Analytics Productivity Index.",
    },
    {
      id: 2,
      category: "alarms",
      categoryLabel: "Smart Alarms",
      que: "Will my Smart Alarm ring if the browser tab is minimized or in the background?",
      ans: "Yes! Taskaro uses a custom Web Worker background scheduler that runs uninterrupted even when Chrome or Edge throttles background tabs. Additionally, if you enable desktop notifications, a native browser alert with sound will trigger on time.",
    },
    {
      id: 3,
      category: "alarms",
      categoryLabel: "Smart Alarms",
      que: "What are the Wake-up Cognitive Challenges?",
      ans: "Taskaro offers anti-snooze challenges including the Math Puzzle (forces you to calculate arithmetic like 34 + 27 before you can dismiss the alarm) and the Morning Affirmation Quote (requires typing a positive sentence). These activate your cognitive state immediately upon waking.",
    },
    {
      id: 4,
      category: "habits",
      categoryLabel: "Habits & Routine",
      que: "How does the 7-day Mon–Sun Habit Matrix function?",
      ans: "Each habit features a dynamic 7-day Mon-Sun check-in strip. Clicking any day instantly logs your check-in, recalculates your consecutive streak record, and updates your routine consistency score in real time.",
    },
    {
      id: 5,
      category: "tasks",
      categoryLabel: "Task Management",
      que: "Can I set tasks for today without getting rejected?",
      ans: "Absolutely! We updated the task scheduler so you can create tasks for today, tomorrow, or any future date. Tasks due today automatically appear on your Overview dashboard under 'Today's Focus'.",
    },
    {
      id: 6,
      category: "alarms",
      categoryLabel: "Smart Alarms",
      que: "Can I test the alarm sound before setting it?",
      ans: "Yes, every alarm card and the Create Alarm form features a 'Test Sound' button. Clicking it previews the audio tone (Classic Bell, Gentle Chime, Energetic Beat, or Radar Siren) and immediately unlocks your browser audio engine.",
    },
    {
      id: 7,
      category: "security",
      categoryLabel: "Account & Security",
      que: "How can I change my password or email?",
      ans: "Navigate to Account & Profile Settings from your sidebar or top menu. For credentials accounts, you can request a two-step 6-digit verification code sent to your registered email to reset your password securely.",
    },
    {
      id: 8,
      category: "security",
      categoryLabel: "Account & Security",
      que: "What happens if I sign in using Google OAuth?",
      ans: "If you sign in with Google, your identity is authenticated via OAuth 2.0. Password changes and two-factor authentication are safely managed through your Google Account settings.",
    },
    {
      id: 9,
      category: "billing",
      categoryLabel: "Analytics & Export",
      que: "How do I export my task and productivity history?",
      ans: "Go to Analytics & Reports in your dashboard. You can switch between 7 Days, 30 Days, 90 Days, and 1 Year time horizons, and click 'Export CSV' to instantly download your complete audit trail ledger with dates, priorities, and statuses.",
    },
    {
      id: 10,
      category: "tasks",
      categoryLabel: "Task Management",
      que: "What happens when I delete a task? Is it permanently gone?",
      ans: "Deleted tasks are safely transferred to the Trash ledger where they remain for 30 days. You can restore any accidentally deleted task back to its exact active state at any time.",
    },
    {
      id: 11,
      category: "habits",
      categoryLabel: "Habits & Routine",
      que: "Can I create custom recurring habit schedules (e.g. Weekdays only)?",
      ans: "Yes. When creating a habit, you can select recurrence patterns such as Everyday, Weekdays, Weekends, or Custom Days (selecting specific days of the week).",
    },
    {
      id: 12,
      category: "billing",
      categoryLabel: "Plans & Features",
      que: "Is Taskaro free to use for personal productivity?",
      ans: "Yes, Taskaro provides a rich free tier that includes full task prioritization, smart alarms with challenges, habit streak tracking, and executive analytics.",
    },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.que.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.ans.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleAccordion = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* HEADER SECTION */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4 border-b border-(--color-border)">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles size={14} />
            <span>KNOWLEDGE BASE & SUPPORT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-(--color-text)">
            Frequently Asked Questions
          </h1>

          <p className="text-sm sm:text-base text-(--color-desc) max-w-xl mx-auto leading-relaxed">
            Everything you need to know about Taskaro tasks, smart alarms, cognitive wake-up puzzles, and habit tracking.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-(--color-desc)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. alarm, streak, export, password)..."
              className="w-full text-xs pl-11 pr-4 py-3.5 rounded-2xl bg-(--card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-4">
        <div className="flex items-center justify-center overflow-x-auto pb-2">
          <div className="inline-flex p-1 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs text-xs font-semibold">
            {[
              { id: "all", label: "All Questions" },
              { id: "tasks", label: "Tasks" },
              { id: "alarms", label: "Smart Alarms" },
              { id: "habits", label: "Habits" },
              { id: "security", label: "Security" },
              { id: "billing", label: "Analytics & Plans" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === tab.id
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ACCORDIONS LIST */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-(--color-border) bg-(--card-bg) space-y-3">
            <HelpCircle className="w-10 h-10 text-(--color-desc) mx-auto" />
            <h3 className="text-base font-bold text-(--color-text)">No matching questions found</h3>
            <p className="text-xs text-(--color-desc) max-w-sm mx-auto">
              We could not find any FAQ matching &ldquo;{searchQuery}&rdquo;. Try a different search query or contact our team directly.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "bg-(--card-bg) border-blue-500/40 shadow-xs"
                      : "bg-(--card-bg) border-(--color-border) hover:border-blue-500/30"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                        {faq.categoryLabel}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-(--color-text)">
                        {faq.que}
                      </h3>
                    </div>
                    <div
                      className={`p-1.5 rounded-xl bg-(--hover-card-bg) text-(--color-desc) transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-blue-500" : ""
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-(--color-desc) leading-relaxed border-t border-(--color-border) animate-in fade-in duration-150">
                      {faq.ans}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STILL HAVE QUESTIONS BOX */}
      <section className="max-w-4xl mx-auto px-4 pt-4 pb-24">
        <div className="p-8 sm:p-10 rounded-3xl border border-(--color-border) bg-(--card-bg) flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-bold text-(--color-text) flex items-center justify-center sm:justify-start gap-2">
              <MessageSquare className="text-blue-500" size={20} />
              <span>Still have questions or feedback?</span>
            </h3>
            <p className="text-xs text-(--color-desc) max-w-md">
              Cannot find what you are looking for? Our engineering and support team is ready to assist you.
            </p>
          </div>

          <Link
            href="/contact-us"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Contact Support</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
