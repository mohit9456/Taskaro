import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Scale,
  ShieldAlert,
  BellOff,
  Activity,
  Server,
  ExternalLink,
  Mail,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Legal Disclaimer | Taskaro Platform & Risk Disclosures",
  description:
    "Important legal disclaimers regarding software usage, productivity outcomes, smart alarm delivery, and health discipline tracking on Taskaro.",
  openGraph: {
    title: "Taskaro Legal Disclaimer",
    description:
      "Full disclosure of software capabilities, limitation of liability, and user responsibilities on Taskaro.",
  },
};

export default function LegalDisclaimerPage() {
  const disclaimers = [
    {
      icon: Scale,
      color: "from-blue-500 to-indigo-600",
      title: "1. No Guarantee of Productivity or Commercial Outcomes",
      content:
        "Taskaro provides cognitive organizational tools, habit matrices, smart alarms, and team coordination capabilities designed to assist you in planning and tracking execution. However, we make no representations or warranties that using Taskaro will result in improved personal productivity, business growth, employment advancement, or financial success. Output depends solely on individual effort, external business conditions, and execution discipline.",
    },
    {
      icon: BellOff,
      color: "from-amber-500 to-orange-600",
      title: "2. Smart Alarms & Audio Delivery Limitations",
      content:
        "Taskaro's cognitive alarms utilize modern web audio and cloud-synchronized cron triggers. However, delivery of audible alarms is subject to operating system power-saving policies, browser background tab throttling, device hardware volume levels, and network connectivity. Taskaro alarms should never be used as the sole alert mechanism for critical, life-safety, medical, legal, or statutory emergency deadlines.",
    },
    {
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
      title: "3. Wellness, Water & Gym Trackers Are Not Medical Advice",
      content:
        "The discipline tracking features on Taskaro (including Water Tracking, Gym Habit Routines, and Daily Consistency Pulses) are intended exclusively for personal habit awareness. They do not constitute medical, dietary, psychological, or physical therapy advice. Users should consult licensed healthcare practitioners before starting strenuous physical regimens or altering hydration routines.",
    },
    {
      icon: Server,
      color: "from-purple-500 to-pink-600",
      title: "4. User Content & Backup Responsibility",
      content:
        "You retain sole responsibility for the accuracy, legality, and integrity of all data uploaded or logged onto Taskaro (including task descriptions, team tickets, attachments, and personal notes). While Taskaro performs automated snapshot backups, we cannot guarantee against unexpected hardware failures, external network blackouts, or accidental user deletions. Users are advised to maintain independent backups of business-critical information.",
    },
    {
      icon: ExternalLink,
      color: "from-cyan-500 to-blue-600",
      title: "5. Third-Party Integrations & Payment Gateways",
      content:
        "Taskaro interfaces with reputable third-party services, including Razorpay for payment processing and Google Cloud for Single Sign-On (OAuth). We do not control, manage, or assume legal liability for the uptime, data policies, or service terms of these third-party platforms. Transactions conducted via Razorpay are subject to Razorpay's governing terms of service.",
    },
    {
      icon: ShieldAlert,
      color: "from-rose-500 to-red-600",
      title: "6. 'As-Is' Warranty Disclaimer & Liability Cap",
      content:
        "To the maximum extent permitted by applicable law, Taskaro is provided strictly on an 'AS-IS' and 'AS-AVAILABLE' basis without warranties of any kind, whether express, implied, statutory, or otherwise (including implied warranties of merchantability or fitness for a particular purpose). In no event shall Codistic Innovations or Taskaro developers be liable for indirect, incidental, punitive, or consequential damages resulting from platform downtime or data inaccuracies.",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>LEGAL DISCLOSURE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Legal Disclaimer & Risk Disclosures
            </h1>

            <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
              Last Updated: March 2026 • Please review these operational disclaimers regarding software limitations, smart alarms, and user responsibilities.
            </p>
          </div>
        </div>
      </section>

      {/* 2. DISCLAIMER CARDS GRID */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {disclaimers.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs hover:border-(--color-primary)/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-linear-to-tr ${item.color} text-white flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-(--color-text)">
                  {item.title}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed pt-1">
                {item.content}
              </p>
            </div>
          );
        })}
      </section>

      {/* 3. LEGAL INQUIRIES & CONTACT */}
      <section className="py-12 bg-(--card-bg) border-t border-(--color-border)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-(--color-text)">
            Questions Regarding Our Legal Disclosures?
          </h3>
          <p className="text-xs sm:text-sm text-(--color-desc) max-w-md mx-auto">
            Our legal compliance team is available to assist with statutory inquiries, regulatory compliance, or terms clarifications.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="mailto:legal@taskaro.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--color-primary) text-white font-bold text-xs hover:opacity-90 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact Legal Desk (legal@taskaro.com)</span>
            </a>
            <Link
              href="/terms-conditions"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) font-bold text-xs hover:border-(--color-primary)"
            >
              <span>Terms of Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
