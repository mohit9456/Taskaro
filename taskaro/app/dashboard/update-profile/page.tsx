"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { protectedApiPost, protectedApiGet } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Camera,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Sparkles,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  Flame,
  BellRing,
  CheckSquare,
  Activity,
  Crown,
} from "lucide-react";

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();

  // Tabs
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "stats">("profile");

  // Profile Form State
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [authProvider, setAuthProvider] = useState<string>("credentials");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status & Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password / Security State
  const [securityStep, setSecurityStep] = useState<"initial" | "otp" | "password">("initial");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Real Workspace Stats
  const [userStats, setUserStats] = useState<{
    totalTasks: number;
    completedTasks: number;
    totalHabits: number;
    totalAlarms: number;
  }>({
    totalTasks: 0,
    completedTasks: 0,
    totalHabits: 0,
    totalAlarms: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate user data from session
  useEffect(() => {
    if (!session?.user) return;
    const u: any = session.user;
    setName(u.name || "");
    setEmail(u.email || "");
    setAbout(u.about || "");
    setPhone(u.phone || "");
    setAvatarUrl(u.image || u.profileImage || "");
    setAuthProvider(u.authProvider || (u.image?.includes("googleusercontent.com") ? "google" : "credentials"));
  }, [session]);

  // Load real workspace stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const [tasksRes, habitsRes, alarmsRes] = await Promise.allSettled([
          protectedApiGet("/secure/tasks/list"),
          protectedApiGet("/secure/habits/list"),
          protectedApiGet("/secure/alarm/list"),
        ]);

        let totalTasks = 0;
        let completedTasks = 0;
        if (tasksRes.status === "fulfilled" && tasksRes.value?.task) {
          const list = tasksRes.value.task;
          totalTasks = list.length;
          completedTasks = list.filter((t: any) => t.status === "done").length;
        }

        let totalHabits = 0;
        if (habitsRes.status === "fulfilled" && habitsRes.value?.habits) {
          totalHabits = habitsRes.value.habits.length;
        }

        let totalAlarms = 0;
        if (alarmsRes.status === "fulfilled" && alarmsRes.value?.alarms) {
          totalAlarms = alarmsRes.value.alarms.length;
        }

        setUserStats({
          totalTasks,
          completedTasks,
          totalHabits,
          totalAlarms,
        });
      } catch (e) {
        console.warn("Failed to load workspace stats:", e);
      } finally {
        setStatsLoading(false);
      }
    };

    if (session?.user) {
      loadStats();
    }
  }, [session?.user]);

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfileError(null);
  };

  // Submit Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("about", about.trim());
      formData.append("phone", phone.trim());

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const res: any = await protectedApiPost("/secure/edit-profile", formData);

      if (res?.success || res?.user) {
        setProfileSuccess(res?.message || "Profile updated successfully!");

        const updatedImg = res?.user?.profileImage || previewUrl || avatarUrl;
        if (updatedImg) {
          setAvatarUrl(updatedImg);
        }

        // Update NextAuth Session in-memory
        await update({
          name: name.trim(),
          about: about.trim(),
          phone: phone.trim(),
          image: updatedImg,
        });

        setSelectedFile(null);
        setTimeout(() => setProfileSuccess(null), 4000);
      } else {
        setProfileError(res?.error || "Failed to update profile");
      }
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.error ||
          err?.message ||
          "An error occurred while saving profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Security Step 1: Send OTP to Email
  const handleSendOtp = async () => {
    setSecurityLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);

    try {
      const res: any = await protectedApiPost("/secure/validate-email");
      setSecuritySuccess(res?.message || "Verification code sent to your email!");
      setSecurityStep("otp");
    } catch (err: any) {
      setSecurityError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  // Security Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setSecurityError("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    setSecurityLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);

    try {
      const res: any = await protectedApiPost("/secure/verify-otp", { otp: otp.trim() });
      setSecuritySuccess(res?.message || "Identity confirmed! Enter your new password.");
      setSecurityStep("password");
    } catch (err: any) {
      setSecurityError(
        err?.response?.data?.error ||
          err?.message ||
          "Invalid or expired verification code."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  // Security Step 3: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setSecurityError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match.");
      return;
    }

    setSecurityLoading(true);
    setSecurityError(null);
    setSecuritySuccess(null);

    try {
      const res: any = await protectedApiPost("/secure/update-password", {
        password: newPassword,
        cPassword: confirmPassword,
      });

      setSecuritySuccess(res?.message || "Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setSecurityStep("initial");
      setTimeout(() => setSecuritySuccess(null), 5000);
    } catch (err: any) {
      setSecurityError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to update password. Please try again."
      );
    } finally {
      setSecurityLoading(false);
    }
  };

  const getUserInitials = (n: string) => {
    if (!n) return "U";
    return n
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-(--color-desc) hover:text-(--color-text) transition mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text) flex items-center gap-2.5">
            <User className="text-blue-500" size={28} />
            Account & Profile Settings
          </h1>
          <p className="text-xs sm:text-sm text-(--color-desc) mt-1">
            Manage your personal identity, workspace bio, photo, and security credentials.
          </p>
        </div>

        {/* Account Badge */}
        <div className="flex items-center gap-2">
          {(session?.user as any)?.isPro && (
            <div className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>PRO MEMBER</span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-xl border border-(--color-border) bg-(--card-bg) text-xs font-semibold text-(--color-text) shadow-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span className="capitalize">
              {authProvider === "google" ? "Google Account" : "Credentials Verified"}
            </span>
          </div>
        </div>
      </div>

      {/* TOP USER BANNER */}
      <div className="rounded-3xl border border-(--color-border) bg-(--card-bg) shadow-xs overflow-hidden">
        {/* Cover Header */}
        <div className="h-28 sm:h-36 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 relative p-4 flex items-end justify-end">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/30 backdrop-blur-md text-white border border-white/20">
            Taskaro Workspace ID • {session?.user?.email?.split("@")[0] || "member"}
          </span>
        </div>

        {/* Profile Card Body */}
        <div className="px-5 sm:px-8 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Avatar with Upload Button */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-4 border-(--card-bg) shadow-lg overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt={name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold">
                    {getUserInitials(name)}
                  </div>
                )}
              </div>

              {/* Upload Trigger Icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change profile avatar"
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer border-2 border-(--card-bg)"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name & Email info */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-(--color-text) flex items-center justify-center sm:justify-start gap-2">
                <span>{name || "Taskaro Member"}</span>
                {(session?.user as any)?.isPro && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs tracking-wider">
                    PRO
                  </span>
                )}
                {authProvider === "google" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Google Connected
                  </span>
                )}
              </h2>
              <p className="text-xs text-(--color-desc) flex items-center justify-center sm:justify-start gap-1">
                <Mail size={12} />
                <span>{email}</span>
              </p>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="flex items-center justify-center gap-3 text-xs text-(--color-desc)">
            <span className="px-3 py-1 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
              {userStats.totalTasks} Tasks Created
            </span>
            <span className="px-3 py-1 rounded-xl bg-(--hover-card-bg) border border-(--color-border)">
              {userStats.totalHabits} Habits Active
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-(--card-bg) border border-(--color-border) shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "profile"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
          }`}
        >
          <User size={14} />
          <span>General Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "security"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
          }`}
        >
          <KeyRound size={14} />
          <span>Security & Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "stats"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg)"
          }`}
        >
          <Activity size={14} />
          <span>Workspace Overview</span>
        </button>
      </div>

      {/* TAB 1: GENERAL PROFILE FORM */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleSaveProfile}
          className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) space-y-6 shadow-xs"
        >
          <div>
            <h3 className="text-base font-bold text-(--color-text) flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              <span>Personal Information</span>
            </h3>
            <p className="text-xs text-(--color-desc) mt-0.5">
              Update your public display name, phone number, and personal statement.
            </p>
          </div>

          {/* Feedback Alerts */}
          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-(--color-text)">
                Registered Email Address
              </label>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 size={12} /> Verified Primary ID
              </span>
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
              <input
                type="email"
                readOnly
                value={email}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl bg-(--hover-card-bg)/50 border border-(--color-border) text-(--color-desc) cursor-not-allowed outline-none select-none"
              />
            </div>
          </div>

          {/* Bio / About */}
          <div>
            <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
              Workspace Bio & Manifesto
            </label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="A short manifesto about your goals, habits, or professional background..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) placeholder:text-(--color-desc) outline-none focus:ring-2 focus:ring-blue-500/30 resize-none font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-(--color-border) flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                const u: any = session?.user;
                setName(u?.name || "");
                setAbout(u?.about || "");
                setPhone(u?.phone || "");
                setPreviewUrl(null);
                setSelectedFile(null);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-(--color-border) bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) transition cursor-pointer"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <div className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-(--color-text) flex items-center gap-2">
              <Lock size={16} className="text-blue-500" />
              <span>Security & Password Management</span>
            </h3>
            <p className="text-xs text-(--color-desc) mt-0.5">
              Secure your account credentials using two-factor identity email verification.
            </p>
          </div>

          {/* Feedback Alerts */}
          {securitySuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{securitySuccess}</span>
            </div>
          )}

          {securityError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{securityError}</span>
            </div>
          )}

          {/* If Account is Google Single Sign-On */}
          {authProvider === "google" ? (
            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Shield size={18} />
                <span>Google OAuth Protected Account</span>
              </div>
              <p className="text-(--color-desc) leading-relaxed">
                Your account is authenticated via Google Single Sign-On. Your password, multi-factor authentication, and account access recovery are securely managed directly through your Google Account settings.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Initial Request OTP */}
              {securityStep === "initial" && (
                <div className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 mt-0.5">
                      <KeyRound size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-(--color-text)">
                        Two-Step Password Verification
                      </h4>
                      <p className="text-xs text-(--color-desc) leading-relaxed">
                        To protect your account, we will send a 6-digit confirmation code to your registered email (<strong>{email}</strong>).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={securityLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    {securityLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={14} />
                        <span>Send Verification OTP</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: Verify OTP */}
              {securityStep === "otp" && (
                <form
                  onSubmit={handleVerifyOtp}
                  className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-(--color-text)">
                      Enter Verification Code
                    </h4>
                    <p className="text-xs text-(--color-desc)">
                      We sent a 6-digit code to <strong>{email}</strong>. Enter it below to unlock the password change form.
                    </p>
                  </div>

                  <div className="max-w-xs">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="• • • • • •"
                      className="w-full text-center text-xl font-mono font-bold tracking-widest px-3 py-2.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={securityLoading || otp.length < 4}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2"
                    >
                      {securityLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify Code</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={securityLoading}
                      className="text-xs text-blue-500 hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Set New Password */}
              {securityStep === "password" && (
                <form
                  onSubmit={handleUpdatePassword}
                  className="p-5 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-(--color-text)">
                      Set Your New Password
                    </h4>
                    <p className="text-xs text-(--color-desc)">
                      Your identity is verified. Choose a strong password with at least 8 characters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters"
                          className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--color-desc) hover:text-(--color-text)"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold text-(--color-text) mb-1.5">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--color-desc)" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl bg-(--card-bg) border border-(--color-border) text-(--color-text) outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={securityLoading}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer flex items-center gap-2 shadow-xs"
                    >
                      {securityLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WORKSPACE OVERVIEW & STATS */}
      {activeTab === "stats" && (
        <div className="p-6 sm:p-8 rounded-3xl border border-(--color-border) bg-(--card-bg) space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-(--color-text) flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              <span>Workspace Productivity Audit</span>
            </h3>
            <p className="text-xs text-(--color-desc) mt-0.5">
              Live statistics connected to your actual MongoDB task records and habits.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
              <div className="text-xs text-(--color-desc) flex items-center gap-1.5 font-medium">
                <CheckSquare size={14} className="text-blue-500" /> Total Tasks
              </div>
              <p className="text-2xl font-bold text-(--color-text)">
                {statsLoading ? "—" : userStats.totalTasks}
              </p>
              <p className="text-[11px] text-(--color-desc)">Across all priorities</p>
            </div>

            <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
              <div className="text-xs text-(--color-desc) flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={14} className="text-emerald-500" /> Completed
              </div>
              <p className="text-2xl font-bold text-emerald-500">
                {statsLoading ? "—" : userStats.completedTasks}
              </p>
              <p className="text-[11px] text-(--color-desc)">Tasks marked done</p>
            </div>

            <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
              <div className="text-xs text-(--color-desc) flex items-center gap-1.5 font-medium">
                <Flame size={14} className="text-amber-500" /> Daily Habits
              </div>
              <p className="text-2xl font-bold text-amber-500">
                {statsLoading ? "—" : userStats.totalHabits}
              </p>
              <p className="text-[11px] text-(--color-desc)">Routines tracked</p>
            </div>

            <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) space-y-1">
              <div className="text-xs text-(--color-desc) flex items-center gap-1.5 font-medium">
                <BellRing size={14} className="text-purple-500" /> Smart Alarms
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {statsLoading ? "—" : userStats.totalAlarms}
              </p>
              <p className="text-[11px] text-(--color-desc)">Configured schedules</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) flex items-center justify-between text-xs">
            <span className="text-(--color-desc)">
              Want to see deep execution velocity and day-of-week rhythms?
            </span>
            <Link
              href="/dashboard/reports"
              className="font-semibold text-blue-500 hover:text-blue-600 transition"
            >
              Open Full Analytics Suite &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
