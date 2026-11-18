import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  CreditCard,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Taskaro User Agreement",
  description:
    "Review the terms, acceptable use policies, and subscription rules governing your use of Taskaro's web platform and services.",
  openGraph: {
    title: "Taskaro Terms of Service",
    description:
      "Clear, transparent terms governing account usage, Pro subscriptions, intellectual property, and acceptable conduct.",
  },
};

export default function TermsConditionsPage() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "accounts", title: "2. Account Security & Registration" },
    { id: "subscriptions", title: "3. Pro Subscriptions & Razorpay Billing" },
    { id: "acceptable-use", title: "4. Acceptable Use Policy" },
    { id: "ip", title: "5. Intellectual Property & Your Content" },
    { id: "teams", title: "6. Pro Teams & SLA Governance" },
    { id: "availability", title: "7. Availability & Maintenance" },
    { id: "liability", title: "8. Limitation of Liability" },
    { id: "governing-law", title: "9. Governing Law & Jurisdiction" },
    { id: "contact", title: "10. Contact & Legal Notices" },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-28 md:pb-16 border-b border-(--color-border)">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-linear-to-b from-blue-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>LEGAL AGREEMENT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Taskaro Terms of Service
            </h1>

            <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
              Last Updated: March 2026 • Version 2.2 • Please read these terms carefully before accessing Taskaro.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MAIN DOCUMENT BODY */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* DESKTOP OUTLINE SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 p-5 rounded-3xl bg-(--card-bg) border border-(--color-border) space-y-3 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-(--color-desc)">
              Sections
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
              <Link
                href="/refund-policy"
                className="text-xs text-(--color-primary) font-semibold hover:underline block"
              >
                View Cancellation & Refund Policy &rarr;
              </Link>
            </div>
          </aside>

          {/* MAIN PROSE */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. ACCEPTANCE */}
            <div id="acceptance" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                1. Acceptance of Terms & Eligibility
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                By registering for, accessing, or utilizing any services provided by Taskaro ("the Platform"), you form a legally binding contract with Codistic Innovations. If you are accessing Taskaro on behalf of a company or organizational entity, you represent that you possess the requisite authority to bind that entity to these Terms.
              </p>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                You must be at least 13 years of age (or the minimum legal age for digital consent in your jurisdiction) to establish an account on Taskaro.
              </p>
            </div>

            {/* 2. ACCOUNTS */}
            <div id="accounts" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                2. Account Security & Registration
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                You agree to provide true, accurate, and current information when registering via email credentials or Google OAuth Single Sign-On. You are solely responsible for safeguarding the credentials associated with your account and for all activities that occur under your session.
              </p>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                You must notify Taskaro immediately upon discovering any unauthorized access, credential compromise, or security anomaly.
              </p>
            </div>

            {/* 3. SUBSCRIPTIONS */}
            <div id="subscriptions" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                3. Pro Subscriptions & Razorpay Billing
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Taskaro offers both free access tiers and paid Pro memberships. Paid plans unlock cognitive smart cloud alarms, unlimited habit streak matrices, high-velocity analytics, and the Pro Team Collaboration Suite.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-(--color-desc) pl-2">
                <li><strong className="text-(--color-text)">Payment Processing:</strong> All subscription transactions are processed securely in INR (Indian Rupee) through our authorized payment partner, Razorpay.</li>
                <li><strong className="text-(--color-text)">Billing Intervals:</strong> Subscriptions are billed on a recurring monthly or annual basis as selected during checkout.</li>
                <li><strong className="text-(--color-text)">Cancellation:</strong> You may cancel your subscription at any time prior to your next renewal date. Upon cancellation, you retain Pro features until the conclusion of your current prepaid billing cycle.</li>
              </ul>
            </div>

            {/* 4. ACCEPTABLE USE */}
            <div id="acceptable-use" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                4. Acceptable Use Policy
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                You agree not to engage in any prohibited activities on the platform, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-(--color-desc) pl-2">
                <li>Deploying scrapers, bots, automated crawlers, or load-injection scripts against our APIs.</li>
                <li>Attempting to bypass access controls, tamper with authorization tokens, or exploit software vulnerabilities.</li>
                <li>Transmitting malicious files, viruses, trojans, or unlawful, harassing, or defamatory materials.</li>
                <li>Reselling, sublicensing, or distributing Taskaro platform access without express written authorization.</li>
              </ul>
            </div>

            {/* 5. IP & CONTENT */}
            <div id="ip" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                5. Intellectual Property & Your Content
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                <strong className="text-(--color-text)">Your Content Ownership:</strong> You retain complete, unencumbered ownership of all task data, habit logs, team query tickets, attachments, and notes created on Taskaro. We claim no intellectual property rights over your workspace content.
              </p>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                <strong className="text-(--color-text)">Platform Rights:</strong> All software code, user interface designs, logos, algorithms, and documentation comprising Taskaro are the proprietary property of Codistic Innovations and protected under copyright, trademark, and intellectual property statutes.
              </p>
            </div>

            {/* 6. PRO TEAMS & SLA */}
            <div id="teams" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                6. Pro Teams & SLA Governance
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Taskaro's Cross-Department Query Desk provides SLA timers (e.g. 4-hour blocker resolution targets) and automatic Blocker Pulses to enhance internal team accountability. These SLA targets are workflow tracking mechanisms for your internal team management and do not constitute a legally enforceable service level warranty between Taskaro and the user.
              </p>
            </div>

            {/* 7. AVAILABILITY */}
            <div id="availability" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                7. Service Availability & Maintenance
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                While we strive for 99.98% platform uptime, Taskaro is provided on an "as is" and "as available" basis. Occasional scheduled maintenance, network disruptions, or third-party cloud infrastructure delays may temporarily affect accessibility.
              </p>
            </div>

            {/* 8. LIABILITY */}
            <div id="liability" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                8. Limitation of Liability
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                To the fullest extent permitted by applicable law, in no event shall Taskaro, its directors, employees, or partners be liable for any indirect, incidental, punitive, or consequential damages (including loss of profits, data, or missed commercial deadlines) arising from the use of or inability to use our platform. Our total aggregate liability for any claim shall not exceed the amount paid by you to Taskaro during the twelve (12) months preceding the event.
              </p>
            </div>

            {/* 9. GOVERNING LAW */}
            <div id="governing-law" className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                9. Governing Law & Jurisdiction
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal suit, action, or proceeding arising out of or related to these Terms shall be instituted exclusively in the competent courts having jurisdiction over New Delhi, India.
              </p>
            </div>

            {/* 10. CONTACT */}
            <div id="contact" className="rounded-3xl bg-linear-to-br from-indigo-900/30 to-blue-900/30 border border-indigo-500/30 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-lg sm:text-xl font-bold text-(--color-text)">
                10. Contact & Legal Notices
              </h2>
              <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
                Official notices or formal legal inquiries regarding these Terms should be directed to our legal department:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:legal@taskaro.com"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-xs font-bold hover:opacity-90 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>legal@taskaro.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
