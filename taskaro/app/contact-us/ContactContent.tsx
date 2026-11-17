"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Api } from "@/lib/api";
import {
  Mail,
  User,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function ContactContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("General Inquiry");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !topic.trim() || !message.trim()) {
      setErrorMsg("Please fill in all required fields before submitting.");
      return;
    }

    try {
      setLoading(true);

      const res = await Api.post("/contact", {
        name: name.trim(),
        email: email.trim(),
        topic: topic.trim(),
        message: message.trim(),
      });

      setSuccessMsg(res?.data?.message || "Thank you! Your inquiry has been submitted successfully. We will reply within 4 hours.");
      setName("");
      setEmail("");
      setTopic("General Inquiry");
      setMessage("");

      setTimeout(() => {
        setSuccessMsg(null);
      }, 7000);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to submit your message. Please verify your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* HEADER SECTION */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4 border-b border-(--color-border)">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Sparkles size={14} />
            <span>WE WOULD LOVE TO HEAR FROM YOU</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-(--color-text)">
            Contact & Support Center
          </h1>

          <p className="text-sm sm:text-base text-(--color-desc) max-w-xl mx-auto leading-relaxed">
            Have questions about Taskaro, feature requests, or need technical support?
            Our team responds to all inquiries promptly.
          </p>
        </div>
      </section>

      {/* CONTENT GRID */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: CONTACT DETAILS & STATUS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-bold text-(--color-text) flex items-center gap-2">
                  <Mail className="text-blue-500" size={20} />
                  <span>Direct Communication</span>
                </h2>
                <p className="text-xs text-(--color-desc) mt-1">
                  Reach our engineering and customer success teams directly.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
                  <div className="font-bold text-(--color-text) flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-500" />
                    <span>Response Commitment</span>
                  </div>
                  <p className="text-(--color-desc) leading-relaxed">
                    We review messages constantly and typically respond in less than 4 hours during business days.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
                  <div className="font-bold text-(--color-text) flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>System Status</span>
                  </div>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    All Systems Operational (99.98% Uptime)
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-2">
                  <div className="font-bold text-(--color-text) flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-amber-500" />
                    <span>Frequently Asked Questions</span>
                  </div>
                  <p className="text-(--color-desc)">
                    Looking for quick answers regarding alarms, billing, or habit streaks?
                  </p>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:text-blue-600 transition"
                  >
                    <span>Browse the FAQ Database</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CONTACT FORM (7 cols) */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-(--color-text) flex items-center gap-2">
                  <MessageSquare className="text-blue-500" size={20} />
                  <span>Send an Inquiry</span>
                </h2>
                <p className="text-xs text-(--color-desc) mt-1">
                  Fill in your details and message. We will reach back to your registered email address.
                </p>
              </div>

              {/* Zero-Toast Inline Alerts */}
              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex@example.com"
                      className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Topic of Inquiry */}
              <div>
                <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                  Topic of Inquiry *
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer font-medium"
                >
                  <option value="General Inquiry">General Product Inquiry</option>
                  <option value="Bug Report">Technical Bug Report</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="Smart Alarm Feedback">Smart Alarm & Web Worker Feedback</option>
                  <option value="Enterprise Workspace">Team & Enterprise Workspaces</option>
                  <option value="Billing & Plans">Billing & Subscription Inquiry</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry, feedback, or issue in detail..."
                  className="w-full text-xs px-3.5 py-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
