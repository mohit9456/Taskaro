import React from "react";
import Link from "next/link";
import { CheckCircle2, Crown, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs">
            <Crown size={12} />
            <span>PRO ACTIVATED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--color-text)">
            Payment Successful!
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) leading-relaxed">
            Thank you for upgrading! Your Taskaro Pro membership is now live with all cognitive alarms, habit matrices, and velocity analytics unlocked.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
