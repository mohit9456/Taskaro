"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import logo from "../../../public/Logo3.png";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    cPassword?: string;
  }>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCPassword, setShowCPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      // Only permit numbers and plus sign
      const sanitized = value.replace(/[^\d+]/g, "").slice(0, 15);
      setFormData((prev) => ({ ...prev, phone: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear field-level error on input
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (formError) setFormError(null);
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (cleanPhone.length < 10) {
      errors.phone = "Phone number must be at least 10 digits";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.cPassword) {
      errors.cPassword = "Please confirm your password";
    } else if (formData.password !== formData.cPassword) {
      errors.cPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        cPassword: formData.cPassword,
      };

      // Call registration API
      const res = await axios.post("/api/auth/register", payload);

      if (res.status === 200 || res.status === 201) {
        setSuccessMsg("Account created successfully! Signing you in...");

        // Auto sign-in with credentials
        const signInRes = await signIn("credentials", {
          email: payload.email,
          password: payload.password,
          redirect: false,
        });

        if (signInRes?.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          // If auto sign-in has a delay, redirect to login page
          setTimeout(() => {
            router.push("/auth/login");
          }, 1500);
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
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
            Create your account
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc)">
            Join thousands executing with daily discipline and clarity
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
              {isGoogleLoading ? "Connecting to Google..." : "Sign up with Google"}
            </span>
          </button>

          {/* DIVIDER */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-(--color-border)" />
            <span className="absolute px-3 bg-(--card-bg) text-[11px] font-medium uppercase tracking-wider text-(--color-desc)">
              or register with email
            </span>
          </div>

          {/* GLOBAL SUCCESS BANNER (NO TOASTS) */}
          {successMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* GLOBAL ERROR BANNER (NO TOASTS) */}
          {formError && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          {/* REGISTRATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* FULL NAME */}
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-(--color-text)"
              >
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Alex Mercer"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-(--hover-card-bg) border ${
                    fieldErrors.name
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
                  } text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] font-medium text-rose-500 pl-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
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

            {/* PHONE */}
            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-xs font-semibold text-(--color-text)"
              >
                Phone number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-2xl bg-(--hover-card-bg) border ${
                    fieldErrors.phone
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
                  } text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-[11px] font-medium text-rose-500 pl-1">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-(--color-text)"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
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

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1">
              <label
                htmlFor="cPassword"
                className="block text-xs font-semibold text-(--color-text)"
              >
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-(--color-desc)">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="cPassword"
                  name="cPassword"
                  type={showCPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.cPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`w-full text-sm pl-10 pr-11 py-2.5 rounded-2xl bg-(--hover-card-bg) border ${
                    fieldErrors.cPassword
                      ? "border-rose-500 focus:ring-rose-500/30"
                      : "border-(--color-border) focus:border-(--color-primary) focus:ring-(--color-primary)/20"
                  } text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-3 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowCPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-(--color-desc) hover:text-(--color-text) transition-colors cursor-pointer"
                  aria-label={showCPassword ? "Hide password" : "Show password"}
                >
                  {showCPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.cPassword && (
                <p className="text-[11px] font-medium text-rose-500 pl-1">
                  {fieldErrors.cPassword}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2.5 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* TRUST BADGE */}
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-(--color-desc)">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit encryption • No credit card required</span>
          </div>
        </div>

        {/* BOTTOM LOGIN LINK */}
        <p className="text-center text-xs text-(--color-desc)">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-(--color-primary) hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
