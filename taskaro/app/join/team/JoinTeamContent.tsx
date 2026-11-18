"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Building2,
  Users2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Crown,
  Sparkles,
  RefreshCw,
  LogIn,
} from "lucide-react";

interface InvitationData {
  inviteEmail: string;
  role: "owner" | "admin" | "lead" | "member";
  jobTitle: string;
  organization: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
  };
  department?: {
    _id: string;
    name: string;
    code: string;
    color: string;
  };
  invitedBy?: {
    name: string;
    email: string;
  };
  status: string;
}

export default function JoinTeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token found in the link.");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/team/invite?token=${token}`);
        const data = await res.json();

        if (res.ok && data.invitation) {
          setInvitation(data.invitation);
        } else {
          setError(data.error || "This invitation link is invalid or has expired.");
        }
      } catch {
        setError("Network error validating your invitation link.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    try {
      setAccepting(true);
      setError(null);
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (res.ok) {
        setAccepted(true);
        setTimeout(() => {
          router.push("/dashboard/team");
        }, 1500);
      } else {
        setError(data.error || "Failed to accept invitation.");
      }
    } catch {
      setError("Network error accepting invitation.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || authStatus === "loading") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-(--color-primary) animate-spin" />
        <p className="text-sm font-medium text-(--color-desc)">Verifying team invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-(--card-bg) border border-rose-500/30 p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-(--color-text)">Invitation Link Error</h2>
          <p className="text-xs text-(--color-desc) leading-relaxed">
            {error || "This invitation token is invalid or has already been used."}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-xl bg-(--color-primary) text-white font-bold text-xs hover:opacity-90 shadow-xs"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLoggedIn = authStatus === "authenticated" && session?.user;

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full rounded-3xl bg-(--card-bg) border border-(--color-border) p-7 sm:p-9 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER BRAND */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-indigo-600 via-blue-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            {invitation.organization.name.substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block">
              Team Invitation
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-(--color-text) tracking-tight">
              Join {invitation.organization.name}
            </h1>
            <p className="text-xs text-(--color-desc)">
              Invited by <strong className="text-(--color-text)">{invitation.invitedBy?.name || "Team Lead"}</strong>
            </p>
          </div>
        </div>

        {/* INVITATION DETAILS CARD */}
        <div className="p-4 rounded-2xl bg-(--hover-card-bg)/70 border border-(--color-border) space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-(--color-border)/50">
            <span className="text-(--color-desc)">Department</span>
            <span className="font-bold text-(--color-text) flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: invitation.department?.color || "#6366f1" }}
              />
              {invitation.department?.name || "General"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-(--color-border)/50">
            <span className="text-(--color-desc)">Designated Role</span>
            {invitation.role === "lead" ? (
              <span className="inline-flex items-center gap-1 font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" /> Department Lead
              </span>
            ) : (
              <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                Team Member
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-(--color-desc)">Job Title</span>
            <span className="font-semibold text-(--color-text)">{invitation.jobTitle}</span>
          </div>
        </div>

        {/* ACCEPTANCE LOGIC */}
        {accepted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
            <p className="text-sm font-bold">Invitation Accepted!</p>
            <p className="text-xs text-(--color-desc)">Entering your new team workspace now...</p>
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-(--color-desc) text-center">
              Signed in as <strong className="text-(--color-text)">{session.user?.email}</strong>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3.5 rounded-2xl bg-(--color-primary) hover:opacity-90 text-white font-extrabold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Joining Workspace...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Accept Invitation & Enter Team</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-center text-(--color-desc)">
              To accept this invitation, please sign in or register with your email:{" "}
              <b className="text-(--color-text)">{invitation.inviteEmail}</b>
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href={`/auth/login?callbackUrl=/join/team?token=${token}`}
                className="py-3 px-4 rounded-xl bg-(--color-primary) text-white font-bold text-xs text-center hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>

              <Link
                href={`/auth/register?email=${encodeURIComponent(invitation.inviteEmail)}`}
                className="py-3 px-4 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-(--color-text) font-bold text-xs text-center hover:border-(--color-primary) transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Register</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
