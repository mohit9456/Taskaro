"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import logo from "../../../public/Logo3.png";
import axios from "axios";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function ResetClient() {
  const [formData, setFormData] = useState({ password: "", cPassword: "" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/auth/forgot-password");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.cPassword) {
      setErrorMsg("Please fill out both password fields");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.cPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post("/api/auth/reset-password", {
        password: formData.password,
        cPassword: formData.cPassword,
        token: token,
      });

      setSuccessMsg(
        res.data?.message || "Password reset successful! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Could not reset password. The link may have expired."
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
          <h1 className="text-2xl font-bold tracking-tight text-(--color-text)">
            Set new password
          </h1>
          <p className="text-xs text-(--color-desc)">
            Create a secure password to protect your account
          </p>
        </div>

        {/* CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xl shadow-black/5 space-y-6">
          {/* SUCCESS BANNER */}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* ERROR BANNER */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NEW PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-(--color-text)"
              >
                New password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full text-sm pl-10 pr-11 py-2.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20 text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label
                htmlFor="cPassword"
                className="block text-xs font-semibold text-(--color-text)"
              >
                Confirm new password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="cPassword"
                  name="cPassword"
                  type={showCPassword ? "text" : "password"}
                  value={formData.cPassword}
                  onChange={handleChange}
                  placeholder="Repeat your new password"
                  className="w-full text-sm pl-10 pr-11 py-2.5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20 text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  {showCPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
