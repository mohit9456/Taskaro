"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
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
  CheckSquare,
  Lock,
  Unlock,
  Copy,
  Check,
  Zap,
  ExternalLink,
  MessageCircle,
  Send,
  AlertOctagon,
  ArrowUpRight,
  Shield,
  FileCheck,
  Calendar,
  Inbox,
  Filter,
  X,
  Edit2,
  UserPlus,
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
  role: "owner" | "admin" | "lead" | "member";
  jobTitle: string;
  status: "active" | "invited";
  department?: {
    _id: string;
    name: string;
    code: string;
    color: string;
  };
  capacityWeeklyHours: number;
  inviteToken?: string;
  invitedBy?: {
    _id: string;
    name: string;
    email: string;
  };
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

interface TaskComment {
  _id?: string;
  userId: string;
  userName: string;
  userImage?: string;
  text: string;
  createdAt: string;
}

interface DepartmentTaskData {
  _id: string;
  title: string;
  description: string;
  status: "todo" | "inprogress" | "review" | "blocked" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  completedAt?: string;
  estimatedHours: number;
  proofUrl?: string;
  completionNotes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  } | null;
  createdBy: {
    _id: string;
    name: string;
    email?: string;
  };
  departmentId: {
    _id: string;
    name: string;
    code: string;
    color: string;
    leadId?: string;
  };
  sourceDepartmentId?: {
    _id: string;
    name: string;
    code: string;
    color: string;
  } | null;
  dependencyTaskId?: {
    _id: string;
    title: string;
    status: string;
  } | null;
  blockedByDeptId?: {
    _id: string;
    name: string;
    code: string;
    color: string;
  } | null;
  blockerReason?: string;
  linkedTicketId?: {
    _id: string;
    ticketCode: string;
    title: string;
    status: string;
  } | null;
  isLocked: boolean;
  comments?: TaskComment[];
  createdAt: string;
}

export default function TeamContent() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [orgDetails, setOrgDetails] = useState<{
    organization: OrganizationData;
    myRole: string;
    isOwnerOrAdmin: boolean;
    departments: DepartmentData[];
    members: MemberData[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"departments" | "tasks" | "members">("departments");
  const [taskViewFilter, setTaskViewFilter] = useState<"all" | "intake" | "my">("all");

  // Zero-toast inline feedback state
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAppointLeadModal, setShowAppointLeadModal] = useState<{ deptId: string; deptName: string } | null>(null);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState<{ deptId?: string; deptName?: string } | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState<DepartmentTaskData | null>(null);
  const [showBlockerModal, setShowBlockerModal] = useState<DepartmentTaskData | null>(null);
  const [showProofModal, setShowProofModal] = useState<DepartmentTaskData | null>(null);
  const [selectedTaskDrawer, setSelectedTaskDrawer] = useState<DepartmentTaskData | null>(null);
  const [showEditMemberModal, setShowEditMemberModal] = useState<MemberData | null>(null);

  // Task & Member state
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTaskData[]>([]);
  const [memberWorkloads, setMemberWorkloads] = useState<any[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("all");

  // Form states
  const [taskForm, setTaskForm] = useState({
    departmentId: "",
    sourceDepartmentId: "",
    assignedTo: "", // Empty string = Unassigned Department Intake
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    estimatedHours: 2,
    dependencyTaskId: "",
  });

  const [blockerForm, setBlockerForm] = useState({
    blockedByDeptId: "",
    blockerReason: "",
  });

  const [proofForm, setProofForm] = useState({
    proofUrl: "",
    completionNotes: "",
  });

  const [delegateAssignee, setDelegateAssignee] = useState("");
  const [commentText, setCommentText] = useState("");

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
    role: "member" as "admin" | "lead" | "member",
    jobTitle: "",
  });
  const [selectedLeadUserId, setSelectedLeadUserId] = useState<string>("");
  const [editMemberForm, setEditMemberForm] = useState<{
    role: "admin" | "lead" | "member";
    departmentId: string;
    jobTitle: string;
  }>({ role: "member", departmentId: "", jobTitle: "" });

  const [lastInviteLink, setLastInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPro = Boolean((session?.user as any)?.isPro);
  const currentUserId = (session?.user as any)?.id;

  const currentOrg = orgDetails?.organization;
  const isOwnerOrAdmin = Boolean(
    orgDetails?.isOwnerOrAdmin ||
    orgDetails?.myRole === "owner" ||
    orgDetails?.myRole === "admin" ||
    (currentOrg && currentOrg.ownerId === currentUserId)
  );

  // 1. Fetch User Organizations & Pending Invitations
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/secure/team/org");
      const data = await res.json();
      if (res.ok) {
        setOrganizations(data.organizations || []);
        setPendingInvitations(data.pendingInvitations || []);

        if (data.organizations?.length > 0) {
          const primaryOrgId = data.organizations[0].org._id;
          setSelectedOrgId(primaryOrgId);
          await fetchOrgDetails(primaryOrgId);
          await fetchDepartmentTasks(primaryOrgId);
        } else {
          setOrgDetails(null);
        }
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

  const fetchDepartmentTasks = async (orgId: string, deptId?: string) => {
    try {
      const url = new URL("/api/secure/team/tasks", window.location.origin);
      url.searchParams.set("orgId", orgId);
      if (deptId && deptId !== "all") {
        url.searchParams.set("departmentId", deptId);
      }

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setDepartmentTasks(data.tasks || []);
        setMemberWorkloads(data.memberWorkloads || []);

        // Refresh selected task drawer if currently open
        if (selectedTaskDrawer) {
          const refreshed = (data.tasks || []).find((t: any) => t._id === selectedTaskDrawer._id);
          if (refreshed) setSelectedTaskDrawer(refreshed);
        }
      }
    } catch {
      console.error("Error fetching department tasks.");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrganizations();
    }
  }, [status]);

  useEffect(() => {
    if (selectedOrgId) {
      fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
    }
  }, [selectedDeptFilter, selectedOrgId]);

  // Handle Accept Pending Invitation
  const handleAcceptInvite = async (token: string) => {
    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Invitation accepted! Organization synced." });
        await fetchOrganizations();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to accept invitation." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error accepting invitation." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Decline Pending Invitation
  const handleDeclineInvite = async (token: string) => {
    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch(`/api/team/invite?token=${token}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Invitation declined." });
        await fetchOrganizations();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to decline invitation." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error declining invitation." });
    } finally {
      setSubmitting(false);
    }
  };

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

  // Handle Appoint Department Lead (Admin/Owner Only)
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
        setFeedback({ type: "success", message: data.message || "Invitation generated and dispatched!" });
        if (data.inviteLink) {
          setLastInviteLink(data.inviteLink);
        }
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

  // Handle Update Member Role / Department (Admin Only)
  const handleUpdateMemberRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditMemberModal || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: selectedOrgId,
          memberId: showEditMemberModal._id,
          role: editMemberForm.role,
          departmentId: editMemberForm.departmentId || null,
          jobTitle: editMemberForm.jobTitle,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Member privileges and role updated." });
        setShowEditMemberModal(null);
        await fetchOrgDetails(selectedOrgId);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update member." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating member." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Create / Route Department Task
  const handleCreateDepartmentTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !taskForm.title.trim() || !taskForm.departmentId) {
      setFeedback({ type: "error", message: "Please fill in title and department." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskForm,
          orgId: selectedOrgId,
          assignedTo: taskForm.assignedTo || null, // null if routing to department intake queue
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message || "Task created successfully!" });
        setShowAssignTaskModal(null);
        setTaskForm({
          departmentId: "",
          sourceDepartmentId: "",
          assignedTo: "",
          title: "",
          description: "",
          priority: "medium",
          dueDate: "",
          estimatedHours: 2,
          dependencyTaskId: "",
        });
        await fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
        setActiveTab("tasks");
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to create task." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error creating task." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Lead Delegate from Intake Queue
  const handleDelegateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDelegateModal || !delegateAssignee || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: showDelegateModal._id,
          action: "delegate",
          assignedTo: delegateAssignee,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message || "Task delegated to member!" });
        setShowDelegateModal(null);
        setDelegateAssignee("");
        await fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to delegate task." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error delegating task." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Direct Status Transition (Todo <-> Inprogress <-> Review <-> Done)
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: "todo" | "inprogress" | "review" | "blocked" | "done"
  ) => {
    if (!selectedOrgId) return;

    // If changing to blocked, open Blocker modal
    if (newStatus === "blocked") {
      const task = departmentTasks.find((t) => t._id === taskId);
      if (task) {
        setShowBlockerModal(task);
        setBlockerForm({ blockedByDeptId: "", blockerReason: "" });
        return;
      }
    }

    // If changing to done, open Proof modal
    if (newStatus === "done") {
      const task = departmentTasks.find((t) => t._id === taskId);
      if (task) {
        setShowProofModal(task);
        setProofForm({ proofUrl: task.proofUrl || "", completionNotes: task.completionNotes || "" });
        return;
      }
    }

    try {
      setFeedback(null);
      const res = await fetch("/api/secure/team/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: data.message || `Task moved to ${newStatus.toUpperCase()}!` });
        await fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to update task status." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error updating task status." });
    }
  };

  // Submit Blocker Flag
  const handleSubmitBlocker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBlockerModal || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: showBlockerModal._id,
          status: "blocked",
          blockedByDeptId: blockerForm.blockedByDeptId || null,
          blockerReason: blockerForm.blockerReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Blocker tagged & department lead alerted!" });
        setShowBlockerModal(null);
        await fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to flag blocker." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error submitting blocker." });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Proof of Completion
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showProofModal || !selectedOrgId) return;

    try {
      setSubmitting(true);
      setFeedback(null);
      const res = await fetch("/api/secure/team/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: showProofModal._id,
          status: "done",
          proofUrl: proofForm.proofUrl,
          completionNotes: proofForm.completionNotes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: "success", message: "Task completed with deliverable proof & handshakes cleared!" });
        setShowProofModal(null);
        await fetchDepartmentTasks(selectedOrgId, selectedDeptFilter);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to complete task." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error completing task." });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Comment on Task
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskDrawer || !commentText.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/secure/team/tasks/${selectedTaskDrawer._id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (res.ok) {
        setCommentText("");
        await fetchDepartmentTasks(selectedOrgId!, selectedDeptFilter);
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to add comment." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error adding comment." });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedOrgId || !confirm("Are you sure you want to remove this member from the organization?")) return;

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
  if (!isPro && organizations.length === 0 && pendingInvitations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        <div className="rounded-3xl bg-linear-to-br from-indigo-950 via-slate-900 to-black p-8 md:p-12 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <Crown className="w-3.5 h-3.5 fill-amber-300" />
              <span>PRO COLLABORATION HUB</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Scale Your Team With <br />
              <span className="bg-linear-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Collaborative Command Hub
              </span>
            </h1>
            <p className="text-gray-300 max-w-2xl text-sm md:text-base leading-relaxed">
              Create departments, appoint department leads, route cross-department work to intake queues, flag blockers with live handshakes, attach Jira-style completion proofs, and keep everyone aligned asynchronously.
            </p>

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
  if (organizations.length === 0 && pendingInvitations.length === 0) {
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

  // Filter tasks based on sub-nav (All / Intake / My Tasks)
  const filteredTasks = departmentTasks.filter((t) => {
    if (taskViewFilter === "intake") return !t.assignedTo;
    if (taskViewFilter === "my") return t.assignedTo?._id === currentUserId;
    return true;
  });

  const intakeCount = departmentTasks.filter((t) => !t.assignedTo).length;
  const myTasksCount = departmentTasks.filter((t) => t.assignedTo?._id === currentUserId).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* 🔔 PENDING INVITATIONS BANNER */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          {pendingInvitations.map((inv) => (
            <div
              key={inv._id}
              className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-amber-500/15 via-indigo-500/10 to-purple-500/10 border-2 border-amber-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center font-black text-lg shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black uppercase tracking-wider">
                      Pending Invitation
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-(--color-text)">
                      Join <span className="text-indigo-400 font-black">{inv.org?.name}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-(--color-desc) mt-0.5">
                    Invited as <b className="text-(--color-text)">{inv.role === "lead" ? "Department Lead" : inv.role === "admin" ? "Admin" : "Team Member"}</b> in <b className="text-(--color-text)">{inv.department?.name || "General Team"}</b> by {inv.invitedBy?.name || "Team Founder"}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                <button
                  disabled={submitting}
                  onClick={() => handleAcceptInvite(inv.inviteToken)}
                  className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept & Join Team</span>
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleDeclineInvite(inv.inviteToken)}
                  className="px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-rose-500 text-rose-500 font-bold text-xs cursor-pointer active:scale-95 transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ZERO-TOAST INLINE FEEDBACK */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
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

      {/* LAST INVITATION LINK SHARE CARD */}
      {lastInviteLink && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="min-w-0">
            <p className="text-xs font-bold text-indigo-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Direct Invitation Magic Link Generated:
            </p>
            <p className="text-[11px] font-mono text-(--color-text) truncate mt-0.5 max-w-xl">
              {lastInviteLink}
            </p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(lastInviteLink);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer hover:bg-indigo-500 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Link!" : "Copy Link to Share"}</span>
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
                {orgDetails?.myRole?.toUpperCase() || "MEMBER"}
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
        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "tasks"
                ? "bg-(--color-primary) text-white shadow-xs"
                : "bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text)"
            }`}
          >
            <span>Department Tasks</span>
            {intakeCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-black">
                {intakeCount} intake
              </span>
            )}
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
          {activeTab === "departments" && isOwnerOrAdmin && (
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-3.5 py-2 rounded-xl bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )}

          {activeTab === "tasks" && (
            <button
              onClick={() => {
                setShowAssignTaskModal({
                  deptId: orgDetails?.departments[0]?._id,
                  deptName: orgDetails?.departments[0]?.name,
                });
                setTaskForm((prev) => ({
                  ...prev,
                  departmentId: orgDetails?.departments[0]?._id || "",
                }));
              }}
              className="px-3.5 py-2 rounded-xl bg-(--color-primary) hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create / Route Task</span>
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

      {/* TAB 1: DEPARTMENTS OVERVIEW */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orgDetails?.departments.map((dept) => {
            const memberCount = orgDetails.members.filter((m) => m.department?._id === dept._id).length;
            const activeDeptTasks = departmentTasks.filter(
              (t) => t.departmentId?._id === dept._id && t.status !== "done"
            ).length;
            const deptIntakeTasks = departmentTasks.filter(
              (t) => t.departmentId?._id === dept._id && !t.assignedTo && t.status !== "done"
            ).length;

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

                  <div className="flex items-center gap-4 text-[11px] text-(--color-desc) pt-1 border-t border-(--color-border)/50 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5" />
                      <span>{memberCount} Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{activeDeptTasks} Active Tasks</span>
                    </div>
                    {deptIntakeTasks > 0 && (
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Inbox className="w-3.5 h-3.5" />
                        <span>{deptIntakeTasks} In Intake</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* LEAD SECTION (Admin Only can Appoint/Change Lead) */}
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
                        {dept.leadId?.name || "Not Appointed"}
                      </p>
                    </div>
                  </div>

                  {/* ONLY ADMIN / OWNER CAN CHANGE LEAD */}
                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => setShowAppointLeadModal({ deptId: dept._id, deptName: dept.name })}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-(--card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) transition-colors cursor-pointer shrink-0"
                    >
                      {dept.leadId ? "Change Lead" : "Appoint Lead"}
                    </button>
                  )}
                </div>

                {/* TASK ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowAssignTaskModal({ deptId: dept._id, deptName: dept.name });
                      setTaskForm((prev) => ({ ...prev, departmentId: dept._id }));
                    }}
                    className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Route Work</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDeptFilter(dept._id);
                      setActiveTab("tasks");
                    }}
                    className="py-2 px-3 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Tasks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: DEPARTMENT TASKS, INTAKE & DELEGATION */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* TASK SUB-NAVIGATION & DEPARTMENT FILTER */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-3xl bg-(--card-bg) border border-(--color-border)">
            {/* WORKFLOW VIEW PILLS */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setTaskViewFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  taskViewFilter === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-(--hover-card-bg) text-(--color-desc)"
                }`}
              >
                All Tasks ({departmentTasks.length})
              </button>

              <button
                onClick={() => setTaskViewFilter("intake")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  taskViewFilter === "intake"
                    ? "bg-amber-500 text-black shadow-xs font-extrabold"
                    : "bg-(--hover-card-bg) text-(--color-desc)"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>📥 Unassigned Intake Queue ({intakeCount})</span>
              </button>

              <button
                onClick={() => setTaskViewFilter("my")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  taskViewFilter === "my"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-(--hover-card-bg) text-(--color-desc)"
                }`}
              >
                👤 My Tasks ({myTasksCount})
              </button>
            </div>

            {/* DEPARTMENT FILTER */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs font-bold text-(--color-desc) shrink-0">Filter Dept:</label>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs font-bold text-(--color-text) focus:outline-hidden"
              >
                <option value="all">All Departments</option>
                {orgDetails?.departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MEMBER LIVE WORKLOAD STRIP */}
          {memberWorkloads.length > 0 && (
            <div className="rounded-2xl bg-(--card-bg) border border-(--color-border) p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-(--color-text) flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Member Live Workload & Capacity Indicator</span>
                </p>
                <span className="text-[10px] text-(--color-desc)">Active tasks capacity distribution</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {memberWorkloads.map((mw) => (
                  <div
                    key={mw.memberId}
                    className="p-3 rounded-xl bg-(--hover-card-bg)/60 border border-(--color-border) space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-(--color-text) truncate">{mw.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          mw.activeTasks > 3
                            ? "bg-rose-500/20 text-rose-500"
                            : mw.activeTasks > 0
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "bg-emerald-500/20 text-emerald-500"
                        }`}
                      >
                        {mw.activeTasks > 3 ? "Heavy Load" : mw.activeTasks > 0 ? `${mw.activeTasks} Active` : "Free"}
                      </span>
                    </div>
                    <p className="text-[10px] text-(--color-desc) truncate">{mw.jobTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TASKS LIST */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-(--card-bg) border border-(--color-border) space-y-3">
                <CheckSquare className="w-10 h-10 text-(--color-desc) mx-auto opacity-50" />
                <h3 className="text-sm font-bold text-(--color-text)">
                  {taskViewFilter === "intake"
                    ? "Intake queue is clear! No pending work orders."
                    : taskViewFilter === "my"
                    ? "You have no assigned tasks right now."
                    : "No tasks found."}
                </h3>
                <p className="text-xs text-(--color-desc)">
                  Route tasks across departments, flag blockers, and unlock dependencies.
                </p>
              </div>
            ) : (
              filteredTasks.map((t) => {
                const isTargetDeptLead = t.departmentId?.leadId === currentUserId;
                const canDelegate = isOwnerOrAdmin || isTargetDeptLead;

                return (
                  <div
                    key={t._id}
                    className={`p-4 sm:p-5 rounded-3xl bg-(--card-bg) border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      t.status === "blocked"
                        ? "border-rose-500/40 bg-rose-500/5"
                        : t.isLocked
                        ? "border-amber-500/40 bg-amber-500/5"
                        : t.status === "done"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-(--color-border) hover:border-(--color-primary)/50"
                    }`}
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* TARGET DEPARTMENT BADGE */}
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: t.departmentId?.color || "#6366f1" }}
                        >
                          {t.departmentId?.name || "Dept"}
                        </span>

                        {/* SOURCE DEPARTMENT TAG */}
                        {t.sourceDepartmentId && t.sourceDepartmentId._id !== t.departmentId?._id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-(--hover-card-bg) border border-(--color-border) text-(--color-desc)">
                            From: {t.sourceDepartmentId.name}
                          </span>
                        )}

                        {/* PRIORITY BADGE */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            t.priority === "urgent" || t.priority === "high"
                              ? "bg-rose-500/20 text-rose-500"
                              : t.priority === "medium"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-blue-500/20 text-blue-500"
                          }`}
                        >
                          {t.priority.toUpperCase()}
                        </span>

                        {/* STATUS DROPDOWN (JIRA STYLE - REVERSIBLE ANYTIME) */}
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value as any)}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded border focus:outline-hidden cursor-pointer ${
                            t.status === "done"
                              ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                              : t.status === "inprogress"
                              ? "bg-blue-500/20 text-blue-500 border-blue-500/30"
                              : t.status === "blocked"
                              ? "bg-rose-500/20 text-rose-500 border-rose-500/30"
                              : t.status === "review"
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                          }`}
                        >
                          <option value="todo">TODO</option>
                          <option value="inprogress">IN PROGRESS</option>
                          <option value="review">REVIEW</option>
                          <option value="blocked">🚨 BLOCKED</option>
                          <option value="done">✓ DONE</option>
                        </select>

                        {/* UNASSIGNED INTAKE PILL */}
                        {!t.assignedTo && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                            <Inbox className="w-3 h-3" /> Unassigned Intake
                          </span>
                        )}

                        {/* BLOCKER BADGE */}
                        {t.status === "blocked" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-500 flex items-center gap-1">
                            <AlertOctagon className="w-3 h-3" /> Blocked by: {t.blockedByDeptId?.name || "Another Department"}
                          </span>
                        )}

                        {/* DEPENDENCY LOCK BADGE */}
                        {t.isLocked ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1 border border-amber-500/30">
                            <Lock className="w-3 h-3" /> LOCKED: Waiting on '{t.dependencyTaskId?.title}'
                          </span>
                        ) : null}

                        {/* LINKED TICKET BADGE */}
                        {t.linkedTicketId && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Ticket className="w-3 h-3" /> #{t.linkedTicketId.ticketCode}
                          </span>
                        )}
                      </div>

                      {/* CLICKABLE TASK TITLE OPENS JIRA DRAWER */}
                      <button
                        onClick={() => setSelectedTaskDrawer(t)}
                        className="text-left text-base font-bold text-(--color-text) hover:text-(--color-primary) transition-colors block cursor-pointer"
                      >
                        {t.title}
                      </button>

                      {t.description && (
                        <p className="text-xs text-(--color-desc) line-clamp-2 max-w-2xl">{t.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-[11px] text-(--color-desc) pt-1 flex-wrap">
                        <span>
                          Assigned to: <b className="text-(--color-text)">{t.assignedTo?.name || "Unassigned (Intake)"}</b>
                        </span>
                        <span>Estimated: <b className="text-(--color-text)">{t.estimatedHours}h</b></span>
                        {t.dueDate && (
                          <span>Due: <b className="text-(--color-text)">{new Date(t.dueDate).toLocaleDateString()}</b></span>
                        )}
                        {t.completedAt && (
                          <span className="text-emerald-500 font-bold">
                            Completed: {new Date(t.completedAt).toLocaleDateString()}
                          </span>
                        )}
                        {t.proofUrl && (
                          <a
                            href={t.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 font-bold flex items-center gap-1 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View Deliverable
                          </a>
                        )}
                        {t.comments && t.comments.length > 0 && (
                          <span className="text-indigo-400 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {t.comments.length} comments
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS: DELEGATE INTAKE OR OPEN DRAWER */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!t.assignedTo && canDelegate && (
                        <button
                          onClick={() => {
                            setShowDelegateModal(t);
                            setDelegateAssignee("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Delegate to Member</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTaskDrawer(t)}
                        className="px-3 py-1.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) hover:border-(--color-primary) text-(--color-text) text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Details & Activity</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MEMBERS DIRECTORY & ROSTER */}
      {activeTab === "members" && (
        <div className="space-y-6">
          {/* ROSTER KPI OVERVIEW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border)">
              <p className="text-xs text-(--color-desc)">Total Roster</p>
              <h4 className="text-2xl font-black text-(--color-text) mt-1">{orgDetails?.members.length || 0}</h4>
            </div>
            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border)">
              <p className="text-xs text-(--color-desc)">Active Members</p>
              <h4 className="text-2xl font-black text-emerald-500 mt-1">
                {orgDetails?.members.filter((m) => m.status === "active").length || 0}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border)">
              <p className="text-xs text-(--color-desc)">Pending Invites</p>
              <h4 className="text-2xl font-black text-amber-500 mt-1">
                {orgDetails?.members.filter((m) => m.status === "invited").length || 0}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-(--card-bg) border border-(--color-border)">
              <p className="text-xs text-(--color-desc)">Departments</p>
              <h4 className="text-2xl font-black text-indigo-500 mt-1">
                {orgDetails?.departments.length || 0}
              </h4>
            </div>
          </div>

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
                        ) : member.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-500 border border-blue-500/30">
                            <Shield className="w-3 h-3" /> ADMIN
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
                        <div className="flex items-center justify-end gap-1.5">
                          {/* COPY INVITE LINK FOR PENDING MEMBERS */}
                          {member.status === "invited" && member.inviteToken && (
                            <button
                              onClick={() => {
                                const baseUrl = window.location.origin;
                                const link = `${baseUrl}/join/team?token=${member.inviteToken}`;
                                navigator.clipboard.writeText(link);
                                setFeedback({ type: "success", message: `Magic invite link copied for ${member.user.email}!` });
                              }}
                              className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-600/15 text-indigo-400 hover:bg-indigo-600/25 transition-colors cursor-pointer"
                              title="Copy magic invite link"
                            >
                              Copy Link
                            </button>
                          )}

                          {/* ADMIN CONTROLS: EDIT ROLE / DEPT */}
                          {isOwnerOrAdmin && member.role !== "owner" && (
                            <button
                              onClick={() => {
                                setShowEditMemberModal(member);
                                setEditMemberForm({
                                  role: member.role as any,
                                  departmentId: member.department?._id || "",
                                  jobTitle: member.jobTitle || "",
                                });
                              }}
                              className="p-1.5 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) transition-colors cursor-pointer"
                              title="Edit Member Privileges"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* ADMIN CONTROLS: REMOVE MEMBER */}
                          {isOwnerOrAdmin && member.role !== "owner" && (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / ROUTE DEPARTMENT TASK */}
      {showAssignTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-(--color-text)">
                Create / Route Department Task
              </h3>
              <p className="text-xs text-(--color-desc) mt-0.5">
                Assign directly to a member, or route to a department's unassigned intake queue for the Lead to triage.
              </p>
            </div>

            <form onSubmit={handleCreateDepartmentTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement OAuth JWT callback, Design Hero Illustration"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Target Department *</label>
                  <select
                    required
                    value={taskForm.departmentId}
                    onChange={(e) => setTaskForm({ ...taskForm, departmentId: e.target.value, assignedTo: "" })}
                    className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    <option value="">-- Choose Department --</option>
                    {orgDetails?.departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Assignee Member</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    <option value="">📥 Unassigned (Department Intake Queue)</option>
                    {orgDetails?.members
                      .filter((m) => m.user._id && m.status === "active")
                      .filter((m) =>
                        taskForm.departmentId
                          ? m.department?._id === taskForm.departmentId || !m.department
                          : true
                      )
                      .map((m) => {
                        const mw = memberWorkloads.find((w) => w.userId === m.user._id);
                        return (
                          <option key={m._id} value={m.user._id}>
                            {m.user.name} ({m.jobTitle}) - {mw?.activeTasks || 0} active
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-[10px] text-(--color-desc) mt-0.5">
                    Leave unassigned if you want the Department Lead to delegate it.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent Blocker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-(--color-text) mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                  />
                </div>
              </div>

              {/* OPTIONAL DEPENDENCY LOCK */}
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Dependency Lock (Optional)
                </label>
                <select
                  value={taskForm.dependencyTaskId}
                  onChange={(e) => setTaskForm({ ...taskForm, dependencyTaskId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="">-- No Dependency (Active Immediately) --</option>
                  {departmentTasks
                    .filter((t) => t.status !== "done")
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        Lock until '{t.title}' is completed ({t.departmentId?.name})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Description / Spec</label>
                <textarea
                  rows={2}
                  placeholder="Task instructions, links, or technical notes..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignTaskModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--color-primary) text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Deploying..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LEAD DELEGATE INTAKE TASK */}
      {showDelegateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-(--color-text)">
                Delegate Intake Work to Member
              </h3>
              <p className="text-xs text-(--color-desc) mt-0.5">
                Task: <b className="text-(--color-text)">{showDelegateModal.title}</b> ({showDelegateModal.departmentId?.name})
              </p>
            </div>

            <form onSubmit={handleDelegateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Select Department Member to Own this Task *
                </label>
                <select
                  required
                  value={delegateAssignee}
                  onChange={(e) => setDelegateAssignee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="">-- Choose Member --</option>
                  {orgDetails?.members
                    .filter((m) => m.user._id && m.status === "active")
                    .filter(
                      (m) =>
                        m.department?._id === showDelegateModal.departmentId?._id ||
                        !m.department ||
                        isOwnerOrAdmin
                    )
                    .map((m) => {
                      const mw = memberWorkloads.find((w) => w.userId === m.user._id);
                      return (
                        <option key={m._id} value={m.user._id}>
                          {m.user.name} ({m.jobTitle}) - {mw?.activeTasks || 0} active tasks
                        </option>
                      );
                    })}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDelegateModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !delegateAssignee}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Delegating..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: TAG CROSS-DEPARTMENT BLOCKER */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-rose-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-(--color-text)">
                Flag Blocker on Task: {showBlockerModal.title}
              </h3>
            </div>
            <p className="text-xs text-(--color-desc)">
              Tag the department blocking your execution. Their Department Lead will be notified immediately to clear the bottleneck.
            </p>

            <form onSubmit={handleSubmitBlocker} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Which Department is Blocking You? *
                </label>
                <select
                  required
                  value={blockerForm.blockedByDeptId}
                  onChange={(e) => setBlockerForm({ ...blockerForm, blockedByDeptId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="">-- Choose Blocking Department --</option>
                  {orgDetails?.departments
                    .filter((d) => d._id !== showBlockerModal.departmentId?._id)
                    .map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Blocker Reason & Action Required *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Waiting on API endpoints documentation from Backend team, Missing Figma design assets..."
                  value={blockerForm.blockerReason}
                  onChange={(e) => setBlockerForm({ ...blockerForm, blockerReason: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockerModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Flagging..." : "Tag Blocker & Notify Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: JIRA PROOF OF COMPLETION */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-emerald-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-(--color-text)">
                Complete Task: {showProofModal.title}
              </h3>
            </div>
            <p className="text-xs text-(--color-desc)">
              Attach your deliverable link and notes to verify completion and automatically unlock any dependent tasks.
            </p>

            <form onSubmit={handleSubmitProof} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Deliverable Proof / PR / Asset URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/org/repo/pull/42 or Figma link"
                  value={proofForm.proofUrl}
                  onChange={(e) => setProofForm({ ...proofForm, proofUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">
                  Completion Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of implementation, test results, or next steps..."
                  value={proofForm.completionNotes}
                  onChange={(e) => setProofForm({ ...proofForm, completionNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Finalizing..." : "Mark Complete & Unlock Dependencies"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: JIRA / LINEAR STYLE TASK DETAILS & ACTIVITY */}
      {selectedTaskDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border-l border-(--color-border) w-full max-w-xl h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-5">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-(--color-border) pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: selectedTaskDrawer.departmentId?.color || "#6366f1" }}
                  >
                    {selectedTaskDrawer.departmentId?.name}
                  </span>
                  <span className="text-xs text-(--color-desc)">
                    Created {new Date(selectedTaskDrawer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTaskDrawer(null)}
                  className="p-1 rounded-lg text-(--color-desc) hover:text-(--color-text) hover:bg-(--hover-card-bg) cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TITLE & DESCRIPTION */}
              <div className="space-y-2">
                <h2 className="text-xl font-black text-(--color-text)">{selectedTaskDrawer.title}</h2>
                <p className="text-xs text-(--color-desc) leading-relaxed">
                  {selectedTaskDrawer.description || "No detailed description provided."}
                </p>
              </div>

              {/* METADATA GRID */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-(--hover-card-bg)/50 border border-(--color-border) text-xs">
                <div>
                  <span className="text-(--color-desc) block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-extrabold text-(--color-text) uppercase">{selectedTaskDrawer.status}</span>
                </div>
                <div>
                  <span className="text-(--color-desc) block text-[10px] uppercase font-bold">Priority</span>
                  <span className="font-extrabold text-(--color-text) uppercase">{selectedTaskDrawer.priority}</span>
                </div>
                <div>
                  <span className="text-(--color-desc) block text-[10px] uppercase font-bold">Assigned To</span>
                  <span className="font-bold text-(--color-text)">
                    {selectedTaskDrawer.assignedTo?.name || "Unassigned Intake"}
                  </span>
                </div>
                <div>
                  <span className="text-(--color-desc) block text-[10px] uppercase font-bold">Created By</span>
                  <span className="font-bold text-(--color-text)">{selectedTaskDrawer.createdBy?.name || "Member"}</span>
                </div>
                {selectedTaskDrawer.dueDate && (
                  <div>
                    <span className="text-(--color-desc) block text-[10px] uppercase font-bold">Due Date</span>
                    <span className="font-bold text-(--color-text)">
                      {new Date(selectedTaskDrawer.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedTaskDrawer.completedAt && (
                  <div>
                    <span className="text-emerald-500 block text-[10px] uppercase font-bold">Completed On</span>
                    <span className="font-bold text-emerald-500">
                      {new Date(selectedTaskDrawer.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* PROOF OF COMPLETION LINK */}
              {selectedTaskDrawer.proofUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                  <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Deliverable Proof Attached:
                  </p>
                  <a
                    href={selectedTaskDrawer.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline break-all block"
                  >
                    {selectedTaskDrawer.proofUrl}
                  </a>
                  {selectedTaskDrawer.completionNotes && (
                    <p className="text-[11px] text-(--color-desc) mt-1">{selectedTaskDrawer.completionNotes}</p>
                  )}
                </div>
              )}

              {/* BLOCKER DETAILS */}
              {selectedTaskDrawer.status === "blocked" && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                  <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" /> Work Blocked:
                  </p>
                  <p className="text-xs text-(--color-text)">
                    Waiting on: <b>{selectedTaskDrawer.blockedByDeptId?.name || "Department"}</b>
                  </p>
                  <p className="text-xs text-(--color-desc)">
                    Reason: {selectedTaskDrawer.blockerReason || "Action required"}
                  </p>
                </div>
              )}

              {/* ACTIVITY & COMMENTS SECTION */}
              <div className="space-y-3 pt-3 border-t border-(--color-border)">
                <h4 className="text-xs font-black uppercase tracking-wider text-(--color-desc) flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Discussion & Activity ({selectedTaskDrawer.comments?.length || 0})</span>
                </h4>

                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {(!selectedTaskDrawer.comments || selectedTaskDrawer.comments.length === 0) ? (
                    <p className="text-xs text-(--color-desc) italic">No comments yet. Start the discussion below.</p>
                  ) : (
                    selectedTaskDrawer.comments.map((cm, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-(--hover-card-bg)/80 border border-(--color-border) space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-(--color-text)">{cm.userName}</span>
                          <span className="text-[10px] text-(--color-desc)">
                            {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-(--color-content)">{cm.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* COMMENT INPUT BOX */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-(--color-border) flex items-center gap-2">
              <input
                type="text"
                placeholder="Write a comment, link PR, or mention blocker..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD DEPARTMENT (Admin Only) */}
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

      {/* MODAL 6: APPOINT LEAD (Admin Only) */}
      {showAppointLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">
              Appoint Lead for {showAppointLeadModal.deptName}
            </h3>
            <p className="text-xs text-(--color-desc)">
              Only Admins and Founders can appoint department leads. Leads triage incoming work orders and sign off on queries.
            </p>

            <form onSubmit={handleAppointLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1.5">
                  Select Team Member to Appoint as Lead *
                </label>
                <select
                  required
                  value={selectedLeadUserId}
                  onChange={(e) => setSelectedLeadUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text) focus:outline-hidden"
                >
                  <option value="">-- Choose Member --</option>
                  {orgDetails?.members
                    .filter((m) => m.user._id && m.status === "active")
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

      {/* MODAL 7: INVITE MEMBER */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-(--color-text)">Onboard Team Member</h3>
            <p className="text-xs text-(--color-desc)">
              An invitation email and in-app acceptance banner will be dispatched with a magic onboarding link.
            </p>
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
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="member">Team Member</option>
                  {isOwnerOrAdmin && <option value="lead">Department Lead</option>}
                  {isOwnerOrAdmin && <option value="admin">Organization Admin</option>}
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

      {/* MODAL 8: EDIT MEMBER ROLE & DEPARTMENT (Admin Only) */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-(--card-bg) border border-(--color-border) rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-(--color-text)">Edit Member Privileges</h3>
              <p className="text-xs text-(--color-desc)">
                Member: <b className="text-(--color-text)">{showEditMemberModal.user.name}</b> ({showEditMemberModal.user.email})
              </p>
            </div>

            <form onSubmit={handleUpdateMemberRole} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Role</label>
                <select
                  value={editMemberForm.role}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                >
                  <option value="member">Team Member</option>
                  <option value="lead">Department Lead</option>
                  <option value="admin">Organization Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-(--color-text) mb-1">Department</label>
                <select
                  value={editMemberForm.departmentId}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, departmentId: e.target.value })}
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
                <label className="block text-xs font-bold text-(--color-text) mb-1">Job Title</label>
                <input
                  type="text"
                  value={editMemberForm.jobTitle}
                  onChange={(e) => setEditMemberForm({ ...editMemberForm, jobTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-(--hover-card-bg) border border-(--color-border) text-xs text-(--color-text)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditMemberModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-(--hover-card-bg) text-(--color-desc) hover:text-(--color-text) cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs cursor-pointer"
                >
                  {submitting ? "Saving..." : "Update Privileges"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
