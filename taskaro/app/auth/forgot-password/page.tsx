"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../../public/Logo3.png";
import axios from "axios";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await axios.post("/api/auth/forgot-password", { email: email.trim().toLowerCase() });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Could not send reset instructions. Please check your email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* BRAND & LOGO */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src={logo}
              alt="Taskaro"
              className="w-36 h-auto mx-auto dark:invert dark:brightness-110"
              priority
            />
          </Link>
        </div>

        {/* CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xl shadow-black/5 space-y-6">
          {!isSuccess ? (
            <>
              <div className="space-y-1.5 text-center">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-(--color-primary) flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-(--color-text)">
                  Reset password
                </h1>
                <p className="text-xs text-(--color-desc) leading-relaxed">
                  Enter your email address and we&apos;ll send you a secure link to
                  recover your account.
                </p>
              </div>

              {/* INLINE ERROR BANNER */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-(--color-text)"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder="alex@domain.com"
                      className="w-full text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20 text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-(--color-text)">
                  Check your inbox
                </h2>
                <p className="text-xs text-(--color-desc) leading-relaxed">
                  We sent password reset instructions to{" "}
                  <span className="font-semibold text-(--color-text)">{email}</span>.
                  The link will expire in 1 hour.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl text-xs font-semibold text-white bg-linear-to-r from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM RETURN LINK */}
        <p className="text-center text-xs text-(--color-desc)">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-(--color-primary) hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Back to sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
