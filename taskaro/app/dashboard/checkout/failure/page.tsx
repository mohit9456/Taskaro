import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function CheckoutFailurePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto shadow-md shadow-rose-500/10">
          <AlertCircle size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-(--color-text)">
            Payment Cancelled
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
            The transaction was cancelled or could not be completed. No amount was charged to your payment method.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/pricing"
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Retry Pricing</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl border border-(--color-border) bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
