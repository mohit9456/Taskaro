"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import hero_img from "../../public/clients/clients.png";
import {
  Star,
  Quote,
  CheckCircle2,
  TrendingUp,
  Flame,
  BellRing,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
} from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  highlight: string;
  quote: string;
  featureUsed: string;
}

export default function ClientsContent() {
  const [filter, setFilter] = useState<"all" | "founders" | "engineers" | "creators">("all");

  const testimonials: Testimonial[] = [
    {
      name: "Aarav Sharma",
      role: "Lead Full-Stack Architect",
      company: "SaaSify",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "The cognitive alarm solved my morning sluggishness",
      quote:
        "The smart alarm with the Math Challenge is game-changing. I used to snooze my phone 4 times; now having to calculate 34 + 28 forces my brain to wake up and start executing right away.",
      featureUsed: "Smart Alarm & Math Puzzle",
    },
    {
      name: "Sophia Martinez",
      role: "Founder & Product Lead",
      company: "Novaflow Studio",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "Velocity burndown gives me real executive clarity",
      quote:
        "Taskaro's Analytics suite is unlike any traditional to-do list. The day-of-week rhythm showed me that Tuesday is my Power Day, helping me protect my calendar from unnecessary meetings.",
      featureUsed: "Execution Velocity & Analytics",
    },
    {
      name: "Rohan Patel",
      role: "Senior Engineering Manager",
      company: "DevSprint",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "Habit streaks and tasks in one synchronized dashboard",
      quote:
        "Separating habit tracking from actual task management always caused context switching. Taskaro harmonized my 7-day habit matrices with my high-priority sprint tasks.",
      featureUsed: "Habit Streak Architecture",
    },
    {
      name: "Elena Rostova",
      role: "UX Strategy Director",
      company: "Kinetics Creative",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "The zero-toast inline UI is so refreshingly clean",
      quote:
        "As a UX designer, I hate apps that throw 10 toast popups per minute. Taskaro's subtle inline badges and theme-adaptive colors feel like a native desktop tool.",
      featureUsed: "Clean SaaS Interface",
    },
    {
      name: "Vikram Malhotra",
      role: "Bootstrapped Founder",
      company: "CloudPilot",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "1-Click CSV export saved hours during monthly reviews",
      quote:
        "At the end of every month, I just hit 'Export CSV' in Reports and get the complete task ledger with timestamps, priority levels, and completion rates. Super clean.",
      featureUsed: "Ledger Audit & CSV Export",
    },
    {
      name: "Chloe Chen",
      role: "Content Operations Lead",
      company: "Horizon Media",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      rating: 5,
      highlight: "Web Worker clock never misses an alarm in background",
      quote:
        "I leave Taskaro open in a pinned browser tab. Even when my browser is minimized, the web worker engine triggers the alarm right on time with loud sound and desktop notification.",
      featureUsed: "Background Precision Scheduler",
    },
  ];

  const filteredTestimonials = testimonials;

  const trustLogos = [
    "Next.js Teams",
    "Indie Hackers",
    "SaaS Founders",
    "Remote Creators",
    "Product Leads",
    "High-Growth Startups",
    "Full-Stack Devs",
    "Design Studios",
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden border-b border-(--color-border)">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Text */}
          <div className="lg:w-3/5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck size={14} />
              <span>OVER 10,000+ HIGH PERFORMERS ON TASKARO</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--color-text) leading-tight">
              Real stories from people who <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500">
                mastered their daily execution.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-(--color-desc) max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover how modern professionals, founders, and engineers use Taskaro to organize their priority tasks,
              eliminate morning snooze habits, and maintain unbreakable consistency.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="px-4 py-2 rounded-2xl bg-(--card-bg) border border-(--color-border) text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>4.9 / 5 Rating</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-(--card-bg) border border-(--color-border) text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>98.4% Execution Velocity</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-(--card-bg) border border-(--color-border) text-xs font-semibold shadow-xs flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>10k+ Daily Habit Streaks</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:w-2/5 flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden border border-(--color-border) bg-(--card-bg) shadow-xl p-3">
              <Image
                src={hero_img}
                alt="Taskaro Clients"
                className="w-full h-auto rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED PILL MARQUEE */}
      <section className="py-10 border-b border-(--color-border) bg-(--hover-card-bg)/40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-wider font-bold text-(--color-desc) mb-6">
            Empowering professionals across modern technology teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {trustLogos.map((logo, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-xl bg-(--card-bg) border border-(--color-border) text-xs font-medium text-(--color-text) shadow-xs"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS BENTO GRID */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-(--color-text) tracking-tight">
            Loved by engineers, creators, and founders
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Here is what verified Taskaro users have to say about their productivity transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Rating & Feature Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {t.featureUsed}
                  </span>
                </div>

                {/* Highlight Title */}
                <h3 className="text-sm font-bold text-(--color-text) leading-snug">
                  &ldquo;{t.highlight}&rdquo;
                </h3>

                {/* Full Quote */}
                <p className="text-xs text-(--color-desc) leading-relaxed">
                  {t.quote}
                </p>
              </div>

              {/* Author Details */}
              <div className="pt-5 mt-5 border-t border-(--color-border) flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <div className="text-xs font-bold text-(--color-text) flex items-center gap-1">
                    <span>{t.name}</span>
                    <CheckCircle2 size={12} className="text-blue-500" />
                  </div>
                  <div className="text-[11px] text-(--color-desc)">
                    {t.role} • <span className="font-semibold text-(--color-text)">{t.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE VS AFTER IMPACT SECTION */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="rounded-3xl border border-(--color-border) bg-(--card-bg) p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl font-bold text-(--color-text)">
              Measurable Productivity Gains
            </h2>
            <p className="text-xs text-(--color-desc)">
              Real metrics reported by active Taskaro users after 30 days of consistent usage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-500 font-mono">
                -42%
              </div>
              <div className="text-xs font-bold text-(--color-text)">Overdue Backlog</div>
              <p className="text-[11px] text-(--color-desc)">
                Reduction in missed deadlines due to priority scheduling.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-500 font-mono">
                3.4x
              </div>
              <div className="text-xs font-bold text-(--color-text)">Streak Longevity</div>
              <p className="text-[11px] text-(--color-desc)">
                Average increase in daily consecutive habit completions.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-500 font-mono">
                100%
              </div>
              <div className="text-xs font-bold text-(--color-text)">Alarm Precision</div>
              <p className="text-[11px] text-(--color-desc)">
                Zero missed alarms with our dedicated Web Worker engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 pt-8 pb-24 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-b from-blue-600/10 via-indigo-600/10 to-transparent border border-blue-500/20 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-(--color-text) tracking-tight">
            Ready to experience the difference?
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc) max-w-lg mx-auto">
            Get started in seconds. No credit card required. Master your workflow with Taskaro today.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
            >
              <span>Join 10,000+ Users Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
