"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users2,
  Crown,
  Plus,
  ShieldCheck,
  UserCheck,
  Mail,
  Briefcase,
  ChevronRight,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Ticket,
  MessageSquare,
  Activity,
  Layers,
  Sparkles,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface DepartmentData {
  _id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  leadId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
  defaultSlaHours: number;
}

interface MemberData {
  _id: string;
  user: {
    _id?: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  role: "owner" | "lead" | "member";
  jobTitle: string;
  status: "active" | "invited";
  department?: {
    _id: string;
    name: string;
    code: string;
    color: string;
  };
  capacityWeeklyHours: number;
  joinedAt: string;
}

interface OrganizationData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo?: string;
  tier: string;
  ownerId: string;
}

export default function TeamContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<{
    organization: OrganizationData;
    myRole: string;
    departments: DepartmentData[];
    members: MemberData[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"departments" | "members" | "hub">("departments");

  // Inline feedback messages (Zero-toast policy)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAppointLeadModal, setShowAppointLeadModal] = useState<{ deptId: string; deptName: string } | null>(null);

  // Form states
  const [orgForm, setOrgForm] = useState({ name: "", description: "", website: "" });
  const [deptForm, setDeptForm] = useState({
    name: "",
    code: "",
    description: "",
    color: "#6366f1",
    defaultSlaHours: 24,
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    departmentId: "",
    role: "member" as "lead" | "member",
    jobTitle: "",
  });
  const [selectedLeadUserId, setSelectedLeadUserId] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);

  const isPro = Boolean((session?.user as any)?.isPro);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/secure/team/org");
      const data = await res.json();
      if (res.ok && data.organizations?.length > 0) {
        setOrganizations(data.organizations);
        const primaryOrgId = data.organizations[0].org._id;
        setSelectedOrgId(primaryOrgId);
        await fetchOrgDetails(primaryOrgId);
      } else {
        setOrganizations([]);
        setOrgDetails(null);
      }
    } catch {
      setFeedback({ type: "error", message: "Failed to load team organizations." });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgDetails = async (orgId: string) => {
    try {
      const res = await fetch(`/api/secure/team/org/${orgId}`);
      const data = await res.json();
      if (res.ok) {
        setOrgDetails(data);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to load organization details." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error loading organization details." });
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrganizations();
    }
  }, [status]);

  // Handle Org Creation
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgForm.name.trim()) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orgForm),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Organization & default departments deployed successfully!" });
        setShowCreateOrgModal(false);
        setOrgForm({ name: "", description: "", website: "" });
        await fetchOrganizations();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to create organization." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error creating organization." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name.trim() || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...deptForm, orgId: selectedOrgId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: `Department '${deptForm.name}' created successfully.` });
        setShowAddDeptModal(false);
        setDeptForm({ name: "", code: "", description: "", color: "#6366f1", defaultSlaHours: 24 });
        await fetchOrgDetails(selectedOrgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to create department." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error creating department." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Appoint Department Lead
  const handleAppointLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAppointLeadModal || !selectedLeadUserId || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/department", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedOrgId,
          departmentId: showAppointLeadModal.deptId,
          leadUserId: selectedLeadUserId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Department Lead appointed successfully!" });
        setShowAppointLeadModal(null);
        setSelectedLeadUserId("");
        await fetchOrgDetails(selectedOrgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to appoint lead." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error appointing lead." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Invite Member
  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim() || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inviteForm, orgId: selectedOrgId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message || "Member onboarded successfully." });
        setShowInviteModal(false);
        setInviteForm({ email: "", departmentId: "", role: "member", jobTitle: "" });
        await fetchOrgDetails(selectedOrgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to invite member." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error inviting member." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrgId || !confirm("Are you sure you want to remove this member?")) return;

    try {
      setFeedback(null);
      const res = await fetch(`/api/secure/team/members?orgId=${selectedOrgId}&memberId=${memberId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Member removed from organization." });
        await fetchOrgDetails(selectedOrgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to remove member." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error removing member." });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-(--color-primary) animate-spin" />
        <p className="text-sm font-medium text-(--color-desc)">Syncing organization & departments...</p>
      </div>
    );
  }

  // 1. NON-PRO USER VIEW WITH ZERO TEAMS
  if (!isPro && organizations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        <div className="rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-black p-8 md:p-12 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>PRO EXCLUSIVE FEATURE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Scale Your Team With <br />
              <span className="bg-linear-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Collaborative Command Hub
              </span>
            </h1>
            <p className="text-gray-300 max-w-2xl text-sm md:text-base leading-relaxed">
              Create dedicated departments (Engineering, Design, Marketing), appoint department leads, raise cross-department query tickets with automated SLA timers, and talk in real-time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Hierarchical Roles</h4>
                  <p className="text-[11px] text-gray-400">Org Owner $\rightarrow$ Department Leads $\rightarrow$ Members</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <Ticket className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Cross-Dept Ticket Desk</h4>
                  <p className="text-[11px] text-gray-400">Resolve blocker queries with 4h SLA timers</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Real-time Team Chat</h4>
                  <p className="text-[11px] text-gray-400">Department channels & direct 1-on-1 messaging</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">60s Async Standup</h4>
                  <p className="text-[11px] text-gray-400">Zero-meeting morning team sync & blocker tracking</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 text-black font-extrabold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 fill-black" />
                <span>Upgrade to Pro to Create Organization</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PRO USER BUT HAS NO ORGANIZATIONS YET -> WIZARD
  if (organizations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-(--color-text)">Initialize Your Organization</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-xs text-(--color-desc)">Setup your company workspace, departments, and team leads.</p>
            </div>
          </div>

          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                Organization / Company Name *
              </label>
              <input
                type="text"
                required
                value={orgForm.name}
                onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                placeholder="e.g. Codistic Innovations, Acme Corp"
                className="w-full px-4 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-sm text-(--color-text) focus:outline-hidden focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                Description / Mission (Optional)
              </label>
              <textarea
                rows={2}
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                placeholder="Brief summary of your organization goals..."
                className="w-full px-4 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-sm text-(--color-text) focus:outline-hidden focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                Company Website (Optional)
              </label>
              <input
                type="text"
                value={orgForm.website}
                onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-sm text-(--color-text) focus:outline-hidden focus:ring-2 focus:ring-(--color-primary)"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Automatically Seeded Departments:
              </p>
              <p className="text-[11px] text-(--color-desc)">
                Engineering (ENG), UI/UX Design (DSN), Product & QA (PRD), and Operations & Marketing (OPS) will be created automatically. You can add more later.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-(--color-primary) hover:opacity-90 text-white font-bold text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Deploying Hub...</span>
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" />
                  <span>Create Organization & Deploy Departments</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. MAIN PRO TEAM COMMAND CENTER
  const currentOrg = orgDetails?.organization;
  const isOwner = orgDetails?.myRole === "owner";

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* INLINE ZERO-TOAST NOTIFICATION */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TOP ORGANIZATION BANNER */}
      <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {currentOrg?.name?.substring(0, 2).toUpperCase() || "OR"}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-(--color-text)">{currentOrg?.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-linear-to-r from-amber-400 to-yellow-500 text-black shadow-xs tracking-wider">
                PRO ORG
              </span>
              <span className="text-xs text-(--color-desc) font-mono">@{currentOrg?.slug}</span>
            </div>
            <p className="text-xs text-(--color-desc) mt-0.5">
              {currentOrg?.description || "Collaborative multi-department enterprise space."}
            </p>
          </div>
        </div>

        {/* TOP SHORTCUTS */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Link
            href="/dashboard/team/tickets"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Ticket className="w-4 h-4 text-indigo-500" />
            <span>Queries & Tickets</span>
          </Link>
          <Link
            href="/dashboard/team/chat"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) text-xs font-bold flex items-center gap-2 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>Team Chat</span>
          </Link>
          <Link
            href="/dashboard/team/standup"
            className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Activity className="w-4 h-4 text-amber-500" />
            <span>60s Standup</span>
          </Link>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-(--color-border) pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "departments"
                ? "bg-(--color-primary) text-white shadow-xs"
                : "bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text)"
            }`}
          >
            Departments ({orgDetails?.departments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "members"
                ? "bg-(--color-primary) text-white shadow-xs"
                : "bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text)"
            }`}
          >
            Team Directory ({orgDetails?.members?.length || 0})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "departments" && (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-3.5 py-2 rounded-xl bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}
          {activeTab === "members" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: DEPARTMENTS */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orgDetails?.departments.map((dept) => {
            const memberCount = orgDetails.members.filter((m) => m.department?._id === dept._id).length;

            return (
              <div
                key={dept._id}
                className="rounded-3xl bg-(--card-bg) border border-(--color-border) p-5 shadow-xs hover:border-(--color-primary)/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: dept.color || "#6366f1" }}
                      />
                      <h3 className="text-base font-bold text-(--color-text)">{dept.name}</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)">
                      {dept.code}
                    </span>
                  </div>

                  <p className="text-xs text-(--color-desc) line-clamp-2">
                    {dept.description || "Core departmental hub and operational line."}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-(--color-desc) pt-1 border-t border-(--color-border)/50">
                    <div className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5" />
                      <span>{memberCount} Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dept.defaultSlaHours}h SLA Target</span>
                    </div>
                  </div>
                </div>

                {/* LEAD SECTION */}
                <div className="p-3 rounded-2xl bg-(--hover-card-bg) border border-(--color-border) flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {dept.leadId?.name ? dept.leadId.name[0].toUpperCase() : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-(--color-desc) uppercase tracking-wider">
                        Department Lead
                      </p>
                      <p className="text-xs font-bold text-(--color-text) truncate">
                        {dept.leadId?.name || "Not Assigned"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAppointLeadModal({ deptId: dept._id, deptName: dept.name })}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-(--card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) transition-colors cursor-pointer shrink-0"
                  >
                    {dept.leadId ? "Change Lead" : "Appoint Lead"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB CONTENT: MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <div className="rounded-3xl bg-(--card-bg) border border-(--color-border) overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-(--color-border) bg-(--hover-card-bg)/50 text-[10px] font-bold uppercase tracking-wider text-(--color-desc)">
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Job Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border) text-xs">
                {orgDetails?.members.map((member) => (
                  <tr key={member._id} className="hover:bg-(--hover-card-bg)/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {member.user.name ? member.user.name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-(--color-text)">{member.user.name}</p>
                          <p className="text-[11px] text-(--color-desc)">{member.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      {member.role === "owner" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          <Crown className="w-3 h-3 fill-amber-500" /> OWNER
                        </span>
                      ) : member.role === "lead" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-500 border border-indigo-500/30">
                          <ShieldCheck className="w-3 h-3" /> DEPT LEAD
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          MEMBER
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      {member.department ? (
                        <span className="font-semibold text-(--color-text) flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: member.department.color || "#6366f1" }}
                          />
                          {member.department.name}
                        </span>
                      ) : (
                        <span className="text-(--color-desc) italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4 text-(--color-content)">{member.jobTitle || "Team Member"}</td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          member.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {member.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {isOwner && member.role !== "owner" && (
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD DEPARTMENT */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">Create New Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quality Assurance, Growth, Security"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Code (Optional)</label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. QA, SEC, DEV"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Department Color</label>
                <div className="flex items-center gap-2">
                  {["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDeptForm({ ...deptForm, color: c })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        deptForm.color === c ? "scale-110 border-white shadow-md" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Default Ticket SLA (Hours)</label>
                <input
                  type="number"
                  min={2}
                  max={120}
                  value={deptForm.defaultSlaHours}
                  onChange={(e) => setDeptForm({ ...deptForm, defaultSlaHours: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--color-primary) text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Creating..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: APPOINT LEAD */}
      {showAppointLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">
              Appoint Lead for {showAppointLeadModal.deptName}
            </h3>
            <p className="text-xs text-(--color-desc)">
              Department Leads receive urgent blocker alerts, delegate tasks, and sign off on cross-department queries.
            </p>

            <form onSubmit={handleAppointLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                  Select Team Member to Promote
                </label>
                <select
                  required
                  value={selectedLeadUserId}
                  onChange={(e) => setSelectedLeadUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
                >
                  <option value="">-- Choose Member --</option>
                  {orgDetails?.members
                    .filter((m) => m.user._id)
                    .map((m) => (
                      <option key={m._id} value={m.user._id}>
                        {m.user.name} ({m.user.email}) - {m.jobTitle}
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppointLeadModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedLeadUserId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Appointing..." : "Confirm Department Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVITE MEMBER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">Onboard Team Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Member Email *</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Assign Department</label>
                <select
                  value={inviteForm.departmentId}
                  onChange={(e) => setInviteForm({ ...inviteForm, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="">-- General / Unassigned --</option>
                  {orgDetails?.departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Role Hierarchy</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as "lead" | "member" })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="member">Team Member</option>
                  <option value="lead">Department Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer, UI Designer"
                  value={inviteForm.jobTitle}
                  onChange={(e) => setInviteForm({ ...inviteForm, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--color-primary) text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Inviting..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
