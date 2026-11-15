"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import logo from "../../../public/Logo3.png";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Handle URL errors (e.g. NextAuth callback errors)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "OAuthAccountNotLinked") {
      setFormError(
        "An account already exists with this email using password login. Please sign in with email/password."
      );
    } else if (errorParam === "AccessDenied") {
      setFormError("Access was denied. Please try again.");
    } else if (errorParam) {
      setFormError("Authentication failed. Please check your credentials.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-level error on change
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) setFormError(null);
  };

  const validate = () => {
    const errors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (!res) {
        setFormError("An unexpected error occurred. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (res.error) {
        if (res.error === "CredentialsSignin") {
          setFormError("Invalid email or password. Please try again.");
        } else {
          setFormError(res.error || "Sign in failed. Please check your credentials.");
        }
        setIsSubmitting(false);
      } else if (res.ok) {
        // Successful login - redirect to callbackUrl or dashboard
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setFormError(
        err?.message || "Failed to connect to authentication server. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setFormError("Google sign-in encountered an error. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* BRAND & HEADER */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <Image
              src={logo}
              alt="Taskaro"
              className="w-36 h-auto mx-auto dark:invert dark:brightness-110"
              priority
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text)">
            Welcome back
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Enter your credentials to access your productivity suite
          </p>
        </div>

        {/* AUTH CARD */}
        <div className="p-6 sm:p-8 rounded-3xl bg-(--card-bg) border border-(--color-border) shadow-xl shadow-black/5 space-y-6">
          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-(--hover-card-bg) hover:bg-(--color-border)/80 border border-(--color-border) text-sm font-semibold text-(--color-text) transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-(--color-primary)" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
            </span>
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-(--color-border)" />
            <span className="absolute px-3 bg-(--card-bg) text-[11px] font-medium uppercase tracking-wider text-(--color-desc)">
              or sign in with email
            </span>
          </div>

          {/* GLOBAL ERROR BANNER (NO TOASTS) */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {/* CREDENTIALS FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL */}
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
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="alex@domain.com"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-(--hover-card-bg) border ${
                    fieldErrors.email
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
                  } text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] font-medium text-rose-500 pl-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-(--color-text)"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-(--color-primary) hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className={`w-full text-sm pl-10 pr-11 py-2.5 rounded-2xl bg-(--hover-card-bg) border ${
                    fieldErrors.password
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
                  } text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-(--color-desc) hover:text-(--color-text) transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] font-medium text-rose-500 pl-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* BOTTOM SIGNUP LINK */}
        <p className="text-center text-xs text-(--color-desc)">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-semibold text-(--color-primary) hover:underline"
          >
            Create an account free
          </Link>
        </p>
      </div>
    </div>
  );
}
