import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Server,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Mail,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Taskaro Data Protection & Security",
  description:
    "Taskaro's official privacy policy. Learn how we safeguard your personal data, task details, and telemetry with end-to-end security standards.",
  openGraph: {
    title: "Taskaro Privacy Policy",
    description:
      "Transparent, user-first privacy policy explaining data collection, encryption, and statutory user rights.",
  },
};

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "intro", title: "1. Introduction & Overview" },
    { id: "collection", title: "2. Information We Collect" },
    { id: "usage", title: "3. How We Use Your Information" },
    { id: "security", title: "4. Data Security & Encryption" },
    { id: "subprocessors", title: "5. Third-Party Sub-Processors" },
    { id: "retention", title: "6. Data Retention & Deletion Rights" },
    { id: "cookies", title: "7. Cookies & Session Storage" },
    { id: "rights", title: "8. Your Statutory Rights (GDPR/DPDP)" },
    { id: "contact", title: "9. Contact Data Protection Officer" },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DATA TRUST & COMPLIANCE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Taskaro Privacy Policy
            </h1>

            <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
              Last Updated: March 2026 • Version 2.4 • Effective Immediately Across All Taskaro Services
            </p>
          </div>

          {/* KEY TRUST PROMISES CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Zero Data Selling</span>
              </div>
              <p className="text-[11px] text-(--color-desc)">
                We do not sell, rent, or monetize your personal details or task records to third-party ad networks.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs">
                <Server className="w-4 h-4" />
                <span>Encrypted at Rest & Transit</span>
              </div>
              <p className="text-[11px] text-(--color-desc)">
                All transactions and database storage are protected with TLS 1.3 protocol and AES-256 standard encryption.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border) space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                <EyeOff className="w-4 h-4" />
                <span>Private Task Workspaces</span>
              </div>
              <p className="text-[11px] text-(--color-desc)">
                Your notes, habits, alarms, and departmental query tickets are isolated and restricted to authorized members only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN DOCUMENT CONTENT WITH TOC */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* DESKTOP TABLE OF CONTENTS */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 p-5 rounded-3xl bg-(--card-bg) border border-(--color-border) space-y-3 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-(--color-desc)">
              Document Outline
            </p>
            <nav className="space-y-1 text-xs">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block px-3 py-2 rounded-xl text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition-colors font-medium"
                >
                  {s.title}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-(--color-border)">
              <p className="text-[11px] text-(--color-desc)">
                Questions about this policy? Contact our team at{" "}
                <a href="mailto:privacy@taskaro.com" className="text-(--color-primary) font-semibold hover:underline">
                  privacy@taskaro.com
                </a>
              </p>
            </div>
          </aside>

          {/* MAIN PROSE CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            {/* 1. INTRO */}
            <div id="intro" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                1. Introduction & Overview
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Taskaro ("we", "our", "us") is operated by Codistic Innovations. This Privacy Policy governs your use of the Taskaro web applications, smart alarm background cron services, collaborative command hubs, and associated APIs.
              </p>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                By creating a Taskaro account, subscribing to Taskaro Pro, or interacting with our services, you consent to the data collection and processing practices detailed in this document. If you do not agree with this policy, you must discontinue using our platform.
              </p>
            </div>

            {/* 2. COLLECTION */}
            <div id="collection" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                2. Information We Collect
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-(--color-desc)">
                <p>We collect only the minimum required information to provide a high-performance productivity experience:</p>
                <ul className="list-disc list-inside space-y-1.5 pl-2">
                  <li><strong className="text-(--color-text)">Identity & Profile Data:</strong> Full name, verified email address, phone number, profile image URL, and optional professional bio.</li>
                  <li><strong className="text-(--color-text)">Task, Habit & Discipline Content:</strong> Task titles, descriptions, due dates, priority tiers, completion milestones, water intake logs, workout routines, and alarm schedules.</li>
                  <li><strong className="text-(--color-text)">Team & Organizational Records:</strong> Department rosters, Lead appointments, cross-department query tickets, SLA deadlines, in-ticket resolution summaries, and daily async standup pulse submissions.</li>
                  <li><strong className="text-(--color-text)">Payment & Subscription Records:</strong> Razorpay order IDs, subscription IDs, payment confirmation signatures, and plan interval. (Note: We never process or store raw debit/credit card numbers or CVVs on our servers; all payment transactions are tokenized directly through Razorpay).</li>
                  <li><strong className="text-(--color-text)">Technical Logs & Telemetry:</strong> Device browser type, operating system, IP address, and application crash reports for stability troubleshooting.</li>
                </ul>
              </div>
            </div>

            {/* 3. USAGE */}
            <div id="usage" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-(--color-desc) pl-2">
                <li>To authenticate your session securely and maintain multi-device login states.</li>
                <li>To schedule and trigger cognitive smart alarms and scheduled task reminders.</li>
                <li>To calculate your velocity analytics, streak retention, and departmental capacity heatmaps.</li>
                <li>To route cross-department query tickets and send automated blocker escalation alerts when SLA deadlines are reached.</li>
                <li>To prevent fraud, account takeover, and system abuse.</li>
              </ul>
            </div>

            {/* 4. SECURITY */}
            <div id="security" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                4. Data Security & Encryption
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Security is foundational to our architecture. We employ strict physical, electronic, and procedural safeguards:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
                  <p className="font-bold text-(--color-text)">Data in Transit</p>
                  <p className="text-[11px] text-(--color-desc)">Enforced HTTPS/TLS 1.3 cryptographic transport across all endpoints.</p>
                </div>
                <div className="p-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
                  <p className="font-bold text-(--color-text)">Data at Rest</p>
                  <p className="text-[11px] text-(--color-desc)">Encrypted MongoDB collections utilizing AES-256 cryptographic algorithms.</p>
                </div>
              </div>
            </div>

            {/* 5. SUB-PROCESSORS */}
            <div id="subprocessors" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                5. Third-Party Sub-Processors
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Taskaro works with trusted enterprise infrastructure providers that comply with international data security standards:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-(--color-desc) pl-2">
                <li><strong className="text-(--color-text)">Razorpay Software Private Limited:</strong> Payment gateway and subscription management (PCI-DSS Level 1 compliant).</li>
                <li><strong className="text-(--color-text)">Google Cloud Platform / OAuth:</strong> Secure Single Sign-On (SSO) and database clustering.</li>
                <li><strong className="text-(--color-text)">MongoDB Atlas:</strong> Managed database storage with automated snapshot encryption and ISO 27001 certification.</li>
              </ul>
            </div>

            {/* 6. RETENTION & DELETION */}
            <div id="retention" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                6. Data Retention & Deletion Rights
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                You retain complete sovereignty over your data. You may delete individual tasks, restore items from Trash, or request full account termination at any time. When an account is deleted, all associated personal tasks, habit logs, and credentials are permanently purged from our active databases within 14 business days.
              </p>
            </div>

            {/* 7. COOKIES */}
            <div id="cookies" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                7. Cookies & Session Storage
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                We use strictly necessary first-party cookies and secure HTTP-only JWT session cookies to keep you signed in securely. We do not use third-party behavioral advertising cookies or cross-site tracking pixels.
              </p>
            </div>

            {/* 8. RIGHTS */}
            <div id="rights" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                8. Your Statutory Rights (GDPR / CCPA / DPDP)
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Depending on your geographical jurisdiction, you possess the right to:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-(--color-desc) pl-2">
                <li>Request a machine-readable export of all your personal data (Right of Access).</li>
                <li>Request rectification of inaccurate personal records.</li>
                <li>Request permanent erasure of your data (Right to be Forgotten).</li>
                <li>Restrict or object to processing of non-essential telemetry.</li>
              </ul>
            </div>

            {/* 9. CONTACT */}
            <div id="contact" className="rounded-3xl bg-linear-to-br from-indigo-900/30 to-blue-900/30 border border-indigo-500/30 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                9. Contact Our Privacy Office
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                For questions regarding this policy, exercising your statutory rights, or reporting a security matter, contact our Data Protection Officer directly:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:privacy@taskaro.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-bold hover:opacity-90 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>privacy@taskaro.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
