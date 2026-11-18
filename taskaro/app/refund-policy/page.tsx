import { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Mail,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Taskaro 7-Day Guarantee",
  description:
    "Taskaro's clear and transparent refund policy. Learn about our 7-day money-back guarantee, eligible conditions, and Razorpay refund timelines.",
  openGraph: {
    title: "Taskaro Cancellation & Refund Policy",
    description:
      "100% transparent refund terms, 7-day money-back guarantee, and step-by-step refund request instructions.",
  },
};

export default function RefundPolicyPage() {
  const steps = [
    {
      step: "01",
      title: "Initiate Request",
      desc: "Send an email to support@taskaro.com from your registered Taskaro email address with the subject line 'Refund Request'.",
    },
    {
      step: "02",
      title: "Provide Payment Details",
      desc: "Include your Razorpay Order ID or Payment ID (viewable anytime in your dashboard billing history table at /pricing).",
    },
    {
      step: "03",
      title: "Verification & Initiation",
      desc: "Our finance desk validates eligibility within 24 business hours and initiates the Razorpay refund directly to your original source.",
    },
    {
      step: "04",
      title: "Banking Clearance",
      desc: "Funds credit back to your UPI, Debit/Credit Card, or NetBanking account within 5-7 business days depending on your bank.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>BILLING TRANSPARENCY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Cancellation & Refund Policy
            </h1>

            <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
              Last Updated: March 2026 • We believe in transparent, stress-free commitments with a 7-Day Money-Back Guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* 2. THE 7-DAY GUARANTEE PROMISE BOX */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-linear-to-br from-emerald-500/15 via-teal-500/10 to-blue-500/15 border border-emerald-500/30 p-6 sm:p-10 shadow-xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% SATISFACTION COMMITMENT</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-(--color-text) tracking-tight">
            The Taskaro 7-Day Money-Back Guarantee
          </h2>

          <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
            We are confident that Taskaro's smart alarms, habit streaks, velocity analytics, and collaborative team command hubs will elevate your daily output. However, if you upgrade to Taskaro Pro and determine within <strong className="text-(--color-text)">7 calendar days of your initial payment</strong> that the platform does not suit your workflow, simply notify us at <a href="mailto:support@taskaro.com" className="text-(--color-primary) font-semibold hover:underline">support@taskaro.com</a> for a prompt, no-questions-asked refund.
          </p>
        </div>
      </section>

      {/* 3. ELIGIBILITY MATRIX (ELIGIBLE VS NON-ELIGIBLE) */}
      <section className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold text-(--color-text)">
            Eligibility Guidelines
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Here is a clear breakdown of when refunds are issued and when they are not applicable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ELIGIBLE CONDITIONS */}
          <div className="rounded-3xl bg-(--card-bg) border border-emerald-500/30 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-base font-bold text-(--color-text)">Eligible for Full Refund</h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-(--color-desc)">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Within 7 Days of Activation:</strong> First-time purchase of Taskaro Pro (Monthly or Yearly) requested within 7 calendar days of charge.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Duplicate / Accidental Charges:</strong> In the rare event of a system glitch resulting in double deduction for the same billing cycle.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Prolonged Service Outage:</strong> Verified technical disruption preventing core task access for over 48 consecutive hours.</span>
              </li>
            </ul>
          </div>

          {/* NON-ELIGIBLE CONDITIONS */}
          <div className="rounded-3xl bg-(--card-bg) border border-rose-500/30 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 text-rose-500">
              <XCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-(--color-text)">Non-Eligible Situations</h3>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-(--color-desc)">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Beyond 7-Day Window:</strong> Refund claims submitted after 7 calendar days from the initial transaction date.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Uncancelled Automated Renewals:</strong> Recurring monthly or annual billing cycles that were not cancelled prior to the renewal timestamp.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span><strong className="text-(--color-text)">Terms of Service Violations:</strong> Accounts suspended or terminated due to scraping, abusive conduct, or security breaches.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. HOW TO REQUEST A REFUND (STEP-BY-STEP) */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-(--color-text)">
            How to Request a Refund
          </h2>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Four simple steps to process your request smoothly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-(--card-bg) border border-(--color-border) space-y-2 shadow-xs"
            >
              <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-(--hover-card-bg) text-(--color-primary) inline-block">
                STEP {st.step}
              </span>
              <h4 className="text-sm font-bold text-(--color-text)">{st.title}</h4>
              <p className="text-xs text-(--color-desc) leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CONTACT DESK */}
      <section className="py-12 bg-(--card-bg) border-t border-(--color-border)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-(--color-text)">
            Have Questions About an Existing Charge?
          </h3>
          <p className="text-xs sm:text-sm text-(--color-desc) max-w-md mx-auto">
            Our finance and billing desk is ready to review your receipt and ensure prompt resolution.
          </p>
          <div className="pt-2">
            <a
              href="mailto:support@taskaro.com"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-(--color-primary) text-white font-bold text-xs hover:opacity-90 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Billing Support (support@taskaro.com)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
