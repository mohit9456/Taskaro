"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { protectedApiGet, protectedApiPost } from "@/lib/api";
import {
  Crown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
  Clock,
  Flame,
  BellRing,
  BarChart3,
  Receipt,
  ExternalLink,
} from "lucide-react";

interface Transaction {
  id: string;
  planName: string;
  interval: string;
  status: string;
  amount: number;
  currency: string;
  paymentId: string;
  orderId: string;
  date: string;
}

interface SubscriptionStatus {
  subscribed: boolean;
  isPro: boolean;
  planName: string;
  interval: string;
  startDate: string | null;
  endDate: string | null;
  transactions: Transaction[];
}

export default function PricingContent() {
  const router = useRouter();
  const { data: session, update } = useSession();

  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);

  // Inline Feedback States (Zero-Toast Compliance)
  const [loginAlert, setLoginAlert] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch current user subscription and transaction history
  const fetchSubscription = async () => {
    if (!session?.user) return;
    try {
      const res: any = await protectedApiGet("/secure/subscription-plan");
      if (res?.success) {
        setSubStatus(res);
      }
    } catch {
      // If error or unauthenticated, user is free
      setSubStatus(null);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [session?.user]);

  // Handle plan purchase
  const handleSelectPlan = async (planKey: "free" | "pro" | "enterprise") => {
    setLoginAlert(false);
    setCancelMessage(null);
    setSuccessMessage(null);
    setErrorMessage(null);

    // 1. Not Logged In Check
    if (!session?.user) {
      setLoginAlert(true);
      window.scrollTo({ top: 300, behavior: "smooth" });
      return;
    }

    // 2. Free Plan
    if (planKey === "free") {
      setSuccessMessage("You are already enjoying the Free Plan. All basic features are active by default!");
      setTimeout(() => setSuccessMessage(null), 5000);
      return;
    }

    // 3. Already Active Check
    const userIsPro = (session.user as any)?.isPro || subStatus?.isPro;
    if (userIsPro && planKey === "pro") {
      setSuccessMessage("You already have an active Taskaro Pro membership!");
      setTimeout(() => setSuccessMessage(null), 4000);
      return;
    }

    // 4. Initiate Razorpay Order
    setLoadingPlan(planKey);

    try {
      const orderRes: any = await protectedApiPost("/secure/razorpay", {
        planName: planKey,
        interval,
      });

      if (!orderRes?.success || !orderRes?.orderId) {
        throw new Error(orderRes?.error || "Failed to initialize checkout order");
      }

      // Check if Razorpay SDK loaded
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        throw new Error("Razorpay payment gateway is loading. Please try again in a few seconds.");
      }

      const options = {
        key: orderRes.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: "Taskaro Productivity Suite",
        description: `${planKey.toUpperCase()} Membership (${interval === "yearly" ? "Annual" : "Monthly"})`,
        image: "/Logo3.png",
        order_id: orderRes.orderId,
        prefill: {
          name: session.user.name || "",
          email: session.user.email || "",
        },
        theme: {
          color: "#2563eb", // blue-600
        },
        modal: {
          ondismiss: async () => {
            // User closed Razorpay modal without paying
            try {
              await protectedApiPost("/secure/razorpay/cancel", {
                orderId: orderRes.orderId,
                reason: "User closed the payment window",
              });
            } catch {}
            setLoadingPlan(null);
            setCancelMessage("Payment was cancelled. No amount was charged to your account.");
            fetchSubscription();
          },
        },
        handler: async (paymentResponse: any) => {
          // Verification
          try {
            const verifyRes: any = await protectedApiPost("/secure/razorpay/verify", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes?.success) {
              setSuccessMessage("🎉 Congratulations! Welcome to Taskaro Pro. Your account has been upgraded!");
              // Update NextAuth Session in-memory
              await update({
                isPro: true,
                plan: planKey,
              });
              await fetchSubscription();
            } else {
              setErrorMessage(verifyRes?.error || "Payment verification failed. Please contact support.");
            }
          } catch (err: any) {
            setErrorMessage(err?.response?.data?.error || err?.message || "Verification failed");
          } finally {
            setLoadingPlan(null);
          }
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error ||
          err?.message ||
          "Could not start checkout. Please check your connection and try again."
      );
      setLoadingPlan(null);
    }
  };

  const isUserPro = Boolean((session?.user as any)?.isPro || subStatus?.isPro);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="min-h-screen bg-(--color-bg) text-(--color-text) transition-colors duration-200">
        {/* HEADER SECTION */}
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4 border-b border-(--color-border)">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Sparkles size={14} />
              <span>TRANSPARENT, VALUE-FIRST PRICING</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-(--color-text)">
              Invest in your discipline & execution.
            </h1>

            <p className="text-sm sm:text-base text-(--color-desc) max-w-xl mx-auto leading-relaxed">
              Start free forever, or upgrade to Pro to unlock unlimited smart alarms, cognitive wake-up puzzles,
              and 1-year velocity analytics.
            </p>

            {/* MONTHLY / YEARLY TOGGLE */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <div className="inline-flex items-center p-1 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInterval("monthly")}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer ${
                    interval === "monthly"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-(--color-desc) hover:text-(--color-text)"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setInterval("yearly")}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                    interval === "yearly"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-(--color-desc) hover:text-(--color-text)"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
                    SAVE 18%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* INLINE STATUS NOTICES (Zero-Toast Compliance) */}
        <section className="max-w-5xl mx-auto px-4 pt-8">
          {loginAlert && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6">
              <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
                <span>
                  <strong>Authentication Required:</strong> Please log in to Taskaro first to activate or upgrade your membership plan.
                </span>
              </div>
              <Link
                href="/auth/login?redirect=/pricing"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs whitespace-nowrap transition cursor-pointer shadow-xs self-start sm:self-auto"
              >
                Log In to Continue &rarr;
              </Link>
            </div>
          )}

          {cancelMessage && (
            <div className="p-4 rounded-2xl bg-zinc-500/10 border border-zinc-500/20 text-(--color-desc) text-xs flex items-center gap-2.5 mb-6">
              <AlertCircle size={16} className="text-zinc-400 shrink-0" />
              <span>{cancelMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5 font-medium">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap transition cursor-pointer shadow-xs self-start sm:self-auto"
              >
                Go to Dashboard &rarr;
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 mb-6">
              <AlertCircle size={18} className="text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </section>

        {/* PRICING CARDS GRID */}
        <section className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* PLAN 1: FREE / STARTER */}
            <div className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-(--color-text)">Starter Free</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)">
                    DEFAULT
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-(--color-text)">₹0</span>
                    <span className="text-xs text-(--color-desc)">/ forever</span>
                  </div>
                  <p className="text-xs text-(--color-desc)">
                    Essential task command center and personal daily routine tracking.
                  </p>
                </div>

                <div className="pt-4 border-t border-(--color-border) space-y-2.5 text-xs text-(--color-desc)">
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-blue-500 shrink-0" />
                    <span>Prioritized task execution (High / Med / Low)</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-blue-500 shrink-0" />
                    <span>3 Active Smart Alarms</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-blue-500 shrink-0" />
                    <span>3 Daily Habit Streaks</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-blue-500 shrink-0" />
                    <span>7-Day Burndown Velocity metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-blue-500 shrink-0" />
                    <span>Standard Sound Profiles</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("free")}
                  disabled={!isUserPro}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    !isUserPro
                      ? "bg-(--hover-card-bg) text-(--color-text) border border-(--color-border) cursor-default opacity-80"
                      : "bg-(--card-bg) border border-(--color-border) text-(--color-text) hover:bg-(--hover-card-bg)"
                  }`}
                >
                  {!isUserPro ? "Current Active Plan" : "Downgrade to Free"}
                </button>
              </div>
            </div>

            {/* PLAN 2: PRO (FEATURED) */}
            <div className="p-6 sm:p-8 rounded-3xl border-2 border-blue-500 bg-(--card-bg) shadow-xl shadow-blue-500/10 flex flex-col justify-between space-y-6 relative overflow-hidden">
              {/* Highlight ribbon */}
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                MOST POPULAR
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                    <Crown size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-(--color-text)">Taskaro Pro</h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-(--color-text)">
                      {interval === "yearly" ? "₹699" : "₹849"}
                    </span>
                    <span className="text-xs text-(--color-desc)">
                      / month {interval === "yearly" ? "(₹8,388 billed annually)" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-desc)">
                    For founders, engineers, and creators who demand peak discipline.
                  </p>
                </div>

                <div className="pt-4 border-t border-(--color-border) space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span><strong>Unlimited</strong> High-Priority Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span><strong>Unlimited</strong> Smart Alarms & Web Worker Clock</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-purple-500 shrink-0" />
                    <span><strong>Cognitive Wake-Up Puzzles</strong> (Math & Quotes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-amber-500 shrink-0" />
                    <span><strong>Unlimited</strong> Habits & 7-Day Consistency Matrix</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span><strong>1-Year Deep Analytics</strong> & Power Day Detection</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                    <span><strong>1-Click CSV Ledger Export</strong> & Print Reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text) font-medium">
                    <CheckCircle2 size={14} className="text-amber-400 shrink-0" />
                    <span><strong>Golden PRO Badge</strong> across your workspace</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("pro")}
                  disabled={loadingPlan === "pro" || isUserPro}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    isUserPro
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 cursor-default"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 active:scale-98"
                  }`}
                >
                  {loadingPlan === "pro" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Secure Razorpay...</span>
                    </>
                  ) : isUserPro ? (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Active Pro Plan</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade to Pro Now</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PLAN 3: ENTERPRISE */}
            <div className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-(--color-text)">Enterprise Team</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    TEAMS
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold text-(--color-text)">
                      {interval === "yearly" ? "₹1,399" : "₹1,699"}
                    </span>
                    <span className="text-xs text-(--color-desc)">
                      / month {interval === "yearly" ? "(₹16,788 billed annually)" : ""}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-desc)">
                    Centralized multi-seat workspaces for high-growth tech teams.
                  </p>
                </div>

                <div className="pt-4 border-t border-(--color-border) space-y-2.5 text-xs text-(--color-desc)">
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-purple-500 shrink-0" />
                    <span>Everything in Pro Plan</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-purple-500 shrink-0" />
                    <span>Multi-seat Team Workspaces (up to 25 members)</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-purple-500 shrink-0" />
                    <span>Team Productivity Heatmaps</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-purple-500 shrink-0" />
                    <span>Priority 2-hour Technical SLAs</span>
                  </div>
                  <div className="flex items-center gap-2 text-(--color-text)">
                    <Check size={14} className="text-purple-500 shrink-0" />
                    <span>Dedicated Account Success Manager</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleSelectPlan("enterprise")}
                  disabled={loadingPlan === "enterprise"}
                  className="w-full py-3 rounded-2xl text-xs font-bold border border-(--color-border) bg-(--card-bg) hover:bg-(--hover-card-bg) text-(--color-text) transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loadingPlan === "enterprise" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Activate Enterprise</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BILLING & TRANSACTION HISTORY (If logged in) */}
        {session?.user && (
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-(--color-border)">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-(--color-text) flex items-center gap-2">
                    <Receipt className="text-blue-500" size={20} />
                    <span>Your Billing & Subscription Status</span>
                  </h3>
                  <p className="text-xs text-(--color-desc) mt-0.5">
                    Real-time payment records verified with Razorpay payment gateway.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isUserPro ? (
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs flex items-center gap-1">
                      <Crown size={12} />
                      <span>PRO ACTIVE</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)">
                      FREE MEMBER
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-(--color-border) text-(--color-desc)">
                      <th className="pb-3 font-semibold">PLAN & BILLING</th>
                      <th className="pb-3 font-semibold">AMOUNT</th>
                      <th className="pb-3 font-semibold">STATUS</th>
                      <th className="pb-3 font-semibold">DATE</th>
                      <th className="pb-3 font-semibold text-right">PAYMENT REF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--color-border)">
                    {subStatus?.transactions && subStatus.transactions.length > 0 ? (
                      subStatus.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-(--hover-card-bg) transition-colors">
                          <td className="py-3 font-medium text-(--color-text)">
                            <div className="flex items-center gap-1.5">
                              <span>{tx.planName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-(--hover-card-bg) border border-(--color-border) capitalize text-(--color-desc)">
                                {tx.interval}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-(--color-text)">
                            ₹{tx.amount}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                tx.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : tx.status === "failed" || tx.status === "cancelled"
                                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 text-(--color-desc)">{tx.date}</td>
                          <td className="py-3 text-right font-mono text-[11px] text-(--color-desc)">
                            {tx.paymentId || tx.orderId}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-(--color-desc)">
                          No previous transaction records found. You are currently on the Free default tier.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* SECURITY & GUARANTEE CALLOUT */}
        <section className="max-w-4xl mx-auto px-4 pb-24 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-(--color-desc)">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit Encrypted Razorpay Checkout</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Instant Activation Upon Payment</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-500" />
              <span>GST Invoices Available</span>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
