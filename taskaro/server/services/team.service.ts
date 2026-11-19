import mongoose from "mongoose";
import crypto from "crypto";
import { connectToDatabase } from "../db/mongodb";
import Organization from "../models/Organization";
import Department from "../models/Department";
import OrgMember from "../models/OrgMember";
import User from "../models/User";
import Task from "../models/Task";
import Notification from "../models/Notification";
import SubscriptionPlan from "../models/SubscriptionPlan";
import TeamTicket from "../models/TeamTicket";
import TeamMessage from "../models/TeamMessage";
import DailyPulse from "../models/DailyPulse";
import { sendMailService } from "../utils/mailer";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
}

/**
 * Check if a user has active PRO status (manual flag or active subscription)
 */
export async function verifyUserProStatus(userId: string): Promise<boolean> {
  await connectToDatabase();
  const user = await User.findById(userId).select("isPro plan email").lean();
  if (!user) return false;

  if (user.isPro || user.plan === "pro" || user.plan === "enterprise") {
    return true;
  }

  // Double check active subscription record
  const activeSub = await SubscriptionPlan.findOne({
    user: user._id,
    status: "paid",
    "paymentDetails.currentPaymentStatus": "paid",
    endDate: { $gte: new Date() },
  }).lean();

  return Boolean(activeSub);
}

/**
 * CREATE A NEW PRO ORGANIZATION
 */
export async function createOrganizationService(
  userId: string,
  data: {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
  }
) {
  await connectToDatabase();

  const isPro = await verifyUserProStatus(userId);
  if (!isPro) {
    throw {
      status: 403,
      message: "Pro membership required to create an Organization and Department network.",
    };
  }

  const user = await User.findById(userId).lean();
  if (!user) throw { status: 404, message: "User not found" };

  const slug = generateSlug(data.name);

  // 1. Create Organization
  const org = await Organization.create({
    name: data.name.trim(),
    slug,
    ownerId: new mongoose.Types.ObjectId(userId),
    description: data.description || "",
    website: data.website || "",
    logo: data.logo || "",
    tier: "pro",
    status: "active",
  });

  // 2. Create Owner Membership
  await OrgMember.create({
    orgId: org._id,
    userId: new mongoose.Types.ObjectId(userId),
    inviteEmail: user.email.toLowerCase(),
    role: "owner",
    jobTitle: "Founder & Lead",
    status: "active",
    joinedAt: new Date(),
  });

  // 3. Create default seed departments
  const defaultDepts = [
    { name: "Engineering", code: "ENG", color: "#3b82f6", icon: "Code2", defaultSlaHours: 12 },
    { name: "UI/UX Design", code: "DSN", color: "#8b5cf6", icon: "Palette", defaultSlaHours: 16 },
    { name: "Product & QA", code: "PRD", color: "#10b981", icon: "Compass", defaultSlaHours: 24 },
    { name: "Operations & Marketing", code: "OPS", color: "#f59e0b", icon: "Megaphone", defaultSlaHours: 24 },
  ];

  for (const dept of defaultDepts) {
    await Department.create({
      orgId: org._id,
      name: dept.name,
      code: dept.code,
      color: dept.color,
      icon: dept.icon,
      defaultSlaHours: dept.defaultSlaHours,
      leadId: new mongoose.Types.ObjectId(userId), // Owner is default lead until assigned
    });
  }

  return {
    success: true,
    message: "Organization created successfully with default departments.",
    organization: org,
  };
}

/**
 * LIST ORGANIZATIONS USER BELONGS TO
 */
export async function getUserOrganizationsService(userId: string) {
  await connectToDatabase();

  const user = await User.findById(userId).lean();
  if (!user) throw { status: 404, message: "User not found" };

  // Find orgs where user is owner OR active member
  const memberships = await OrgMember.find({
    $or: [
      { userId: new mongoose.Types.ObjectId(userId) },
      { inviteEmail: user.email.toLowerCase() },
    ],
  })
    .populate("orgId")
    .populate("departmentId", "name code color icon")
    .populate("invitedBy", "name email")
    .lean();

  const activeOrgs = memberships
    .filter((m: any) => m.status === "active" && m.orgId)
    .map((m: any) => ({
      org: m.orgId,
      membership: {
        role: m.role,
        jobTitle: m.jobTitle,
        department: m.departmentId,
        status: m.status,
      },
    }));

  const pendingInvites = memberships
    .filter((m: any) => m.status === "invited" && m.orgId)
    .map((m: any) => ({
      _id: m._id,
      org: m.orgId,
      role: m.role,
      jobTitle: m.jobTitle,
      department: m.departmentId,
      inviteToken: m.inviteToken,
      invitedBy: m.invitedBy,
      joinedAt: m.createdAt || m.joinedAt,
    }));

  return {
    success: true,
    organizations: activeOrgs,
    pendingInvitations: pendingInvites,
  };
}

/**
 * GET DETAILED VIEW OF AN ORGANIZATION (Departments, Leads, Members)
 */
export async function getOrganizationDetailsService(userId: string, orgId: string) {
  await connectToDatabase();

  const user = await User.findById(userId).lean();
  if (!user) throw { status: 404, message: "User not found" };

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  // Check caller's role in this org
  const userMembership = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    $or: [{ userId: new mongoose.Types.ObjectId(userId) }, { inviteEmail: user.email.toLowerCase() }],
  }).lean();

  const isOwner = org.ownerId.toString() === userId;
  if (!userMembership && !isOwner) {
    throw { status: 403, message: "You are not a member of this organization." };
  }

  // Fetch all departments
  const departments = await Department.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    isArchived: false,
  })
    .populate("leadId", "name email profileImage role")
    .lean();

  // Fetch all members with user details
  const members = await OrgMember.find({
    orgId: new mongoose.Types.ObjectId(orgId),
  })
    .populate("userId", "name email profileImage")
    .populate("departmentId", "name code color icon")
    .populate("invitedBy", "name email")
    .sort({ role: 1, createdAt: 1 })
    .lean();

  const myRole = isOwner ? "owner" : (userMembership?.role || "member");
  const isOwnerOrAdmin = isOwner || myRole === "owner" || myRole === "admin";

  // Visible departments scoping:
  // If user is Member or Lead: they ONLY see the department they belong to or lead!
  // If user is Owner or Admin: they see all departments.
  let visibleDepartments = departments;
  if (!isOwnerOrAdmin) {
    visibleDepartments = departments.filter((d: any) => {
      const isMyDept =
        userMembership?.departmentId &&
        d._id.toString() === userMembership.departmentId.toString();
      const isLead =
        d.leadId?._id?.toString() === userId || d.leadId?.toString() === userId;
      return isMyDept || isLead;
    });
  }

  return {
    success: true,
    organization: org,
    myRole,
    isOwnerOrAdmin,
    myDepartmentId: userMembership?.departmentId || null,
    departments: visibleDepartments,
    allDepartments: departments,
    members: members.map((m: any) => ({
      _id: m._id,
      user: m.userId || { name: m.inviteEmail.split("@")[0], email: m.inviteEmail, profileImage: null },
      role: m.role,
      jobTitle: m.jobTitle,
      status: m.status,
      department: m.departmentId,
      capacityWeeklyHours: m.capacityWeeklyHours,
      inviteToken: m.inviteToken,
      invitedBy: m.invitedBy,
      joinedAt: m.joinedAt,
    })),
  };
}

/**
 * CREATE NEW DEPARTMENT
 */
export async function createDepartmentService(
  userId: string,
  orgId: string,
  data: {
    name: string;
    code?: string;
    description?: string;
    color?: string;
    icon?: string;
    leadId?: string;
    defaultSlaHours?: number;
  }
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  // Check caller role (must be owner or lead)
  const caller = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (org.ownerId.toString() !== userId && caller?.role !== "owner" && caller?.role !== "lead") {
    throw { status: 403, message: "Only organization owners or leads can create departments." };
  }

  const code = (data.code || data.name.substring(0, 3)).toUpperCase();

  const dept = await Department.create({
    orgId: new mongoose.Types.ObjectId(orgId),
    name: data.name.trim(),
    code,
    description: data.description || "",
    color: data.color || "#6366f1",
    icon: data.icon || "Briefcase",
    leadId: data.leadId ? new mongoose.Types.ObjectId(data.leadId) : null,
    defaultSlaHours: data.defaultSlaHours || 24,
  });

  // If lead is specified, update member role
  if (data.leadId) {
    await OrgMember.findOneAndUpdate(
      { orgId: new mongoose.Types.ObjectId(orgId), userId: new mongoose.Types.ObjectId(data.leadId) },
      { role: "lead", departmentId: dept._id }
    );
  }

  return {
    success: true,
    message: "Department created successfully.",
    department: dept,
  };
}

/**
 * APPOINT OR UPDATE DEPARTMENT LEAD (Strictly Admin / Owner Only)
 */
export async function updateDepartmentLeadService(
  userId: string,
  orgId: string,
  departmentId: string,
  leadUserId: string
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const caller = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const isOwner = org.ownerId.toString() === userId || caller?.role === "owner";
  const isAdmin = caller?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw {
      status: 403,
      message: "Only organization owners or admins can appoint or change department leads.",
    };
  }

  // Check if target user belongs to this org
  const targetMember = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(leadUserId),
  });

  if (!targetMember) {
    throw { status: 400, message: "Selected user is not an active member of this organization." };
  }

  // Update department lead
  const dept = await Department.findByIdAndUpdate(
    departmentId,
    { leadId: new mongoose.Types.ObjectId(leadUserId) },
    { new: true }
  ).populate("leadId", "name email profileImage");

  if (!dept) throw { status: 404, message: "Department not found." };

  // Promote member to "lead" role if currently "member"
  if (targetMember.role === "member") {
    targetMember.role = "lead";
  }
  targetMember.departmentId = new mongoose.Types.ObjectId(departmentId);
  await targetMember.save();

  // Create notification for appointed lead
  try {
    await Notification.create({
      userId: new mongoose.Types.ObjectId(leadUserId),
      title: "👑 Appointed as Department Lead",
      message: `You are now the lead for the ${dept.name} department in ${org.name}.`,
      link: "/dashboard/team",
    });
  } catch {}

  return {
    success: true,
    message: `Department lead appointed successfully for ${dept.name}.`,
    department: dept,
  };
}

/**
 * UPDATE MEMBER ROLE OR DEPARTMENT (Admin / Owner Only)
 */
export async function updateMemberRoleService(
  callerUserId: string,
  orgId: string,
  memberId: string,
  data: {
    role?: "admin" | "lead" | "member";
    departmentId?: string | null;
    jobTitle?: string;
  }
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const caller = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(callerUserId),
  }).lean();

  const isOwner = org.ownerId.toString() === callerUserId || caller?.role === "owner";
  const isAdmin = caller?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw { status: 403, message: "Only organization owners or admins can modify member roles and departments." };
  }

  const member = await OrgMember.findById(memberId);
  if (!member) throw { status: 404, message: "Member record not found" };

  if (member.role === "owner" || member.userId?.toString() === org.ownerId.toString()) {
    if (data.role) {
      throw { status: 400, message: "The organization founder / owner role cannot be changed or downgraded." };
    }
  }

  const updateFields: any = {};
  if (data.role) updateFields.role = data.role;
  if (data.jobTitle) updateFields.jobTitle = data.jobTitle.trim();
  if (data.departmentId !== undefined) {
    updateFields.departmentId = data.departmentId ? new mongoose.Types.ObjectId(data.departmentId) : null;
  }

  const updatedMember = await OrgMember.findByIdAndUpdate(
    memberId,
    { $set: updateFields },
    { new: true }
  );

  return {
    success: true,
    message: "Member updated successfully.",
    member: updatedMember,
  };
}

/**
 * INVITE TEAM MEMBER (Dispatches Email + In-App Notification)
 */
export async function inviteOrgMemberService(
  userId: string,
  orgId: string,
  data: {
    email: string;
    departmentId?: string;
    role?: "admin" | "lead" | "member";
    jobTitle?: string;
  }
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const caller = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const isOwnerOrAdmin = org.ownerId.toString() === userId || caller?.role === "owner" || caller?.role === "admin";
  const isLead = caller?.role === "lead";

  if (!isOwnerOrAdmin && !isLead) {
    throw { status: 403, message: "Only organization admins, owners, or department leads can invite members." };
  }

  // Leads can only invite to their own department
  if (isLead && !isOwnerOrAdmin) {
    if (caller?.departmentId?.toString() !== data.departmentId) {
      throw { status: 403, message: "Department leads can only invite members into their own department." };
    }
  }

  const inviter = await User.findById(userId).select("name email").lean();
  const email = data.email.trim().toLowerCase();

  // Check if target is already an active member of this org
  const existingActive = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    inviteEmail: email,
    status: "active",
  }).lean();

  if (existingActive) {
    throw { status: 400, message: "This user is already an active member of the organization." };
  }

  // Check if existing Taskaro registered user
  const targetUser = await User.findOne({ email }).lean();

  // Find department details if assigned
  let deptName = "General / All Departments";
  if (data.departmentId) {
    const dept = await Department.findById(data.departmentId).lean();
    if (dept) deptName = dept.name;
  }

  // Generate secure invite token
  const inviteToken = crypto.randomBytes(24).toString("hex");
  const baseUrl =
    process.env.BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";
  const inviteLink = `${baseUrl}/join/team?token=${inviteToken}`;

  // Upsert membership: ALWAYS "invited" initially so the user can accept!
  const member = await OrgMember.findOneAndUpdate(
    { orgId: new mongoose.Types.ObjectId(orgId), inviteEmail: email },
    {
      userId: targetUser ? targetUser._id : null,
      departmentId: data.departmentId ? new mongoose.Types.ObjectId(data.departmentId) : null,
      role: data.role || "member",
      jobTitle: data.jobTitle || (data.role === "lead" ? "Department Lead" : "Team Member"),
      status: "invited", // Requires explicit acceptance by the user
      inviteToken,
      invitedBy: new mongoose.Types.ObjectId(userId),
      joinedAt: new Date(),
    },
    { upsert: true, new: true }
  ).populate("userId", "name email profileImage");

  // Send In-App Notification if user is already registered on Taskaro
  if (targetUser) {
    try {
      await Notification.create({
        userId: targetUser._id,
        title: "Team Invitation Pending 🔔",
        message: `${inviter?.name || "A team admin"} invited you to join ${org.name} as ${data.role === "lead" ? "Department Lead" : data.role === "admin" ? "Admin" : "Team Member"} in ${deptName}.`,
        link: `/join/team?token=${inviteToken}`,
      });
    } catch (notifErr) {
      console.error("Failed to create notification:", notifErr);
    }
  }

  // Send invitation email with HTML template
  const roleLabel = data.role === "lead" ? "Department Lead" : data.role === "admin" ? "Admin" : "Team Member";
  const inviterName = inviter?.name || "Your Team Lead";

  const emailResult = await sendMailService({
    to: email,
    subject: `You've been invited to join ${org.name} on Taskaro`,
    text: `Hi there,\n\n${inviterName} has invited you to join ${org.name} as ${roleLabel} in ${deptName}.\n\nClick the link below to accept your invitation:\n${inviteLink}\n\nWelcome aboard,\nTeam Taskaro`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="margin-bottom: 24px;">
          <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px;">You've Been Invited to Join ${org.name}</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Collaborate, track sprints, and eliminate blockers on Taskaro.</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
          <p style="margin: 0 0 10px; font-size: 14px; color: #334155;">
            <strong>${inviterName}</strong> has invited you to collaborate in <strong>${org.name}</strong>.
          </p>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.8;">
            <li><strong>Department:</strong> ${deptName}</li>
            <li><strong>Role:</strong> ${roleLabel}</li>
            <li><strong>Job Title:</strong> ${data.jobTitle || roleLabel}</li>
          </ul>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">
            Accept Invitation & Join Team
          </a>
        </div>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
          Or copy and paste this link in your browser:<br/>
          <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
        </p>
      </div>
    `,
  });

  return {
    success: true,
    message: emailResult.success
      ? `Invitation sent via email to ${email}.`
      : `Invitation generated! Share the magic link below with the user.`,
    inviteLink,
    emailDispatched: emailResult.success,
    member,
  };
}

/**
 * VERIFY INVITATION TOKEN
 */
export async function verifyInviteTokenService(token: string) {
  await connectToDatabase();

  const member = await OrgMember.findOne({ inviteToken: token })
    .populate("orgId", "name slug description logo tier")
    .populate("departmentId", "name code color")
    .populate("invitedBy", "name email")
    .lean();

  if (!member) {
    throw { status: 404, message: "Invalid or expired invitation token." };
  }

  return {
    success: true,
    invitation: {
      inviteEmail: member.inviteEmail,
      role: member.role,
      jobTitle: member.jobTitle,
      organization: member.orgId,
      department: member.departmentId,
      invitedBy: member.invitedBy,
      status: member.status,
    },
  };
}

/**
 * ACCEPT INVITATION & ONBOARD USER
 */
export async function acceptInviteService(userId: string, token: string) {
  await connectToDatabase();

  const user = await User.findById(userId).lean();
  if (!user) throw { status: 404, message: "User not found" };

  const member = await OrgMember.findOne({ inviteToken: token });
  if (!member) {
    throw { status: 404, message: "Invalid or expired invitation link." };
  }

  member.userId = new mongoose.Types.ObjectId(userId);
  member.status = "active";
  member.inviteToken = null;
  member.joinedAt = new Date();
  await member.save();

  // If invited as lead and department is assigned, ensure department leadId is updated
  if (member.role === "lead" && member.departmentId) {
    await Department.findByIdAndUpdate(member.departmentId, {
      leadId: new mongoose.Types.ObjectId(userId),
    });
  }

  return {
    success: true,
    message: "Welcome to the team! You have successfully joined the organization.",
    orgId: member.orgId,
  };
}

/**
 * DECLINE INVITATION
 */
export async function declineInviteService(userId: string, token: string) {
  await connectToDatabase();

  const member = await OrgMember.findOne({ inviteToken: token });
  if (!member) {
    throw { status: 404, message: "Invitation not found or already processed." };
  }

  await OrgMember.findByIdAndDelete(member._id);

  return {
    success: true,
    message: "Invitation declined.",
  };
}

/**
 * CREATE A DEPARTMENT TASK / CROSS-DEPARTMENT WORK REQUEST
 * - If assignedTo is null -> enters department intake queue for lead triage
 * - If assignedTo is given -> checks permission (Lead of that dept or Org Admin)
 */
export async function createDepartmentTaskService(
  callerUserId: string,
  data: {
    orgId: string;
    departmentId: string; // Target department
    sourceDepartmentId?: string; // Requesting department
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    estimatedHours?: number;
    assignedTo?: string | null;
    dependencyTaskId?: string;
    linkedTicketId?: string;
  }
) {
  await connectToDatabase();

  if (!data.title || !data.title.trim()) {
    throw { status: 400, message: "Task title is required." };
  }

  const org = await Organization.findById(data.orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const callerMembership = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(data.orgId),
    userId: new mongoose.Types.ObjectId(callerUserId),
  }).lean();

  const isOwner = org.ownerId.toString() === callerUserId || callerMembership?.role === "owner";
  const isAdmin = callerMembership?.role === "admin";
  const isOwnerOrAdmin = isOwner || isAdmin;

  const targetDept = await Department.findById(data.departmentId).lean();
  if (!targetDept) throw { status: 404, message: "Target department not found" };

  const isLead =
    callerMembership?.role === "lead" ||
    targetDept.leadId?.toString() === callerUserId;

  // 1. Team Members cannot create or assign tasks
  if (!isOwnerOrAdmin && !isLead) {
    throw {
      status: 403,
      message: "Team members cannot assign tasks. Only Department Leads, Admins, or Organization Owners can assign or route tasks.",
    };
  }

  let assignedToUserId: string | null = data.assignedTo ? data.assignedTo : null;

  // 2. Organization Owners and Admins cannot assign tasks to themselves (they delegate to members)
  if (isOwnerOrAdmin && assignedToUserId === callerUserId) {
    throw {
      status: 400,
      message: "Admins and Owners cannot assign tasks to themselves. Assign to a team member or leave in intake.",
    };
  }

  // 3. Department Lead Assignment Rules:
  // - If target is their own department: can assign to themselves or their own department's active members
  // - If target is another department: MUST route to unassigned intake queue so that department's lead can delegate
  if (!isOwnerOrAdmin && isLead) {
    const isCallerInTargetDept =
      callerMembership?.departmentId?.toString() === data.departmentId ||
      targetDept.leadId?.toString() === callerUserId;

    if (isCallerInTargetDept) {
      if (assignedToUserId && assignedToUserId !== callerUserId) {
        const memberInDept = await OrgMember.findOne({
          orgId: data.orgId,
          userId: new mongoose.Types.ObjectId(assignedToUserId),
          departmentId: new mongoose.Types.ObjectId(data.departmentId),
        });
        if (!memberInDept) {
          throw {
            status: 403,
            message: "Department Leads can only assign tasks to members of their own department.",
          };
        }
      }
    } else {
      // Routing work order to another department -> forced to unassigned intake queue!
      assignedToUserId = null;
    }
  }

  // Determine if task starts in locked state
  let isLocked = false;
  if (data.dependencyTaskId) {
    const depTask = await Task.findById(data.dependencyTaskId).lean();
    if (depTask && depTask.status !== "done") {
      isLocked = true;
    }
  }

  const callerDeptId = callerMembership?.departmentId || null;

  const task = await Task.create({
    title: data.title.trim(),
    description: data.description?.trim() || "",
    status: "todo",
    priority: data.priority || "medium",
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    assignedTo: assignedToUserId ? new mongoose.Types.ObjectId(assignedToUserId) : null,
    createdBy: new mongoose.Types.ObjectId(callerUserId),
    orgId: new mongoose.Types.ObjectId(data.orgId),
    departmentId: new mongoose.Types.ObjectId(data.departmentId),
    sourceDepartmentId: data.sourceDepartmentId
      ? new mongoose.Types.ObjectId(data.sourceDepartmentId)
      : callerDeptId,
    requestedBy: new mongoose.Types.ObjectId(callerUserId),
    estimatedHours: data.estimatedHours || 2,
    dependencyTaskId: data.dependencyTaskId ? new mongoose.Types.ObjectId(data.dependencyTaskId) : null,
    linkedTicketId: data.linkedTicketId ? new mongoose.Types.ObjectId(data.linkedTicketId) : null,
    isLocked,
  });

  // Notifications
  if (assignedToUserId) {
    try {
      await Notification.create({
        userId: new mongoose.Types.ObjectId(assignedToUserId),
        title: "New Department Task Assigned",
        message: `You were assigned: '${task.title}'${isLocked ? " (Locked pending dependency)" : ""}`,
        link: "/dashboard/team",
      });
    } catch {}
  } else {
    // Notify target department lead that incoming work has arrived in their intake
    if (targetDept.leadId) {
      try {
        await Notification.create({
          userId: targetDept.leadId,
          title: "📥 Incoming Work in Department Intake",
          message: `A new task '${task.title}' was assigned to ${targetDept.name} for triage and delegation.`,
          link: "/dashboard/team",
        });
      } catch {}
    }
  }

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email profileImage")
    .populate("createdBy", "name email profileImage")
    .populate("departmentId", "name code color icon leadId")
    .populate({ path: "sourceDepartmentId", select: "name code color", strictPopulate: false })
    .populate("dependencyTaskId", "title status")
    .lean();

  return {
    success: true,
    message: assignedToUserId
      ? (isLocked ? "Task created and locked pending dependency completion." : "Task assigned successfully.")
      : `Cross-department work routed to ${targetDept.name}'s intake queue for lead delegation.`,
    task: populated,
  };
}

/**
 * DELEGATE / ASSIGN INTAKE TASK TO DEPARTMENT MEMBER (Lead or Admin Only)
 */
export async function delegateDepartmentTaskService(
  callerUserId: string,
  taskId: string,
  assignedToUserId: string
) {
  await connectToDatabase();

  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: "Task not found" };

  const dept = await Department.findById(task.departmentId).lean();
  if (!dept) throw { status: 404, message: "Department not found" };

  const org = await Organization.findById(task.orgId).lean();

  const callerMembership = await OrgMember.findOne({
    orgId: task.orgId,
    userId: new mongoose.Types.ObjectId(callerUserId),
  }).lean();

  const isOwnerOrAdmin =
    org?.ownerId.toString() === callerUserId ||
    callerMembership?.role === "owner" ||
    callerMembership?.role === "admin";
  const isDeptLead = dept.leadId?.toString() === callerUserId;

  if (!isOwnerOrAdmin && !isDeptLead) {
    throw {
      status: 403,
      message: "Only the Department Lead or an Org Admin can delegate tasks from this department's intake.",
    };
  }

  // Admins & Owners cannot assign to themselves
  if (isOwnerOrAdmin && assignedToUserId === callerUserId) {
    throw {
      status: 400,
      message: "Admins and Owners cannot assign tasks to themselves. Delegate to a department team member.",
    };
  }

  // Validate assignee is in this org
  const assigneeMember = await OrgMember.findOne({
    orgId: task.orgId,
    userId: new mongoose.Types.ObjectId(assignedToUserId),
  }).populate("userId", "name email");

  if (!assigneeMember) {
    throw { status: 400, message: "Selected user is not an active member of this organization." };
  }

  // Dept Leads can only delegate to members of their own department
  if (!isOwnerOrAdmin && isDeptLead && assignedToUserId !== callerUserId) {
    if (assigneeMember.departmentId?.toString() !== dept._id.toString()) {
      throw {
        status: 403,
        message: "Department Leads can only delegate tasks to members of their own department.",
      };
    }
  }

  task.assignedTo = new mongoose.Types.ObjectId(assignedToUserId);
  await task.save();

  // If linked to a ticket, update the ticket's assigned member
  if (task.linkedTicketId) {
    await TeamTicket.findByIdAndUpdate(task.linkedTicketId, {
      $set: {
        assignedMemberId: new mongoose.Types.ObjectId(assignedToUserId),
        status: "in_progress",
      },
    });
  }

  // Notify assignee
  try {
    await Notification.create({
      userId: new mongoose.Types.ObjectId(assignedToUserId),
      title: "Task Delegated by Lead 🎯",
      message: `Your Department Lead delegated: '${task.title}' to you.`,
      link: "/dashboard/team",
    });
  } catch {}

  const populated = await Task.findById(taskId)
    .populate("assignedTo", "name email profileImage")
    .populate("createdBy", "name email profileImage")
    .populate("departmentId", "name code color icon leadId")
    .populate({ path: "sourceDepartmentId", select: "name code color", strictPopulate: false })
    .populate("dependencyTaskId", "title status")
    .lean();

  return {
    success: true,
    message: `Task successfully delegated to ${assigneeMember.userId?.name || "member"}.`,
    task: populated,
  };
}

/**
 * GET DEPARTMENT TASKS & WORKLOAD METRICS
 */
export async function getDepartmentTasksService(
  userId: string,
  orgId: string,
  departmentId?: string
) {
  await connectToDatabase();

  const query: any = {
    orgId: new mongoose.Types.ObjectId(orgId),
    isTrashed: false,
  };

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const callerMembership = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const isOwner = org.ownerId.toString() === userId;
  const myRole = isOwner ? "owner" : (callerMembership?.role || "member");
  const isOwnerOrAdmin = isOwner || myRole === "owner" || myRole === "admin";

  if (!isOwnerOrAdmin) {
    // Member or Lead: scope only to their assigned department!
    if (callerMembership?.departmentId) {
      query.departmentId = new mongoose.Types.ObjectId(callerMembership.departmentId);
    } else {
      query.assignedTo = new mongoose.Types.ObjectId(userId);
    }
  } else if (departmentId && departmentId !== "all") {
    query.departmentId = new mongoose.Types.ObjectId(departmentId);
  }

  const rawTasks = await Task.find(query)
    .populate("assignedTo", "name email profileImage role")
    .populate("createdBy", "name email profileImage")
    .populate("departmentId", "name code color icon leadId")
    .populate({ path: "sourceDepartmentId", select: "name code color", strictPopulate: false })
    .populate({ path: "blockedByDeptId", select: "name code color", strictPopulate: false })
    .populate("dependencyTaskId", "title status")
    .populate("linkedTicketId", "ticketCode title status")
    .sort({ createdAt: -1 })
    .lean();

  // Calculate members live workload in this org
  const members = await OrgMember.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    status: "active",
    ...(departmentId && departmentId !== "all"
      ? { departmentId: new mongoose.Types.ObjectId(departmentId) }
      : {}),
  })
    .populate("userId", "name email profileImage")
    .populate("departmentId", "name code color")
    .lean();

  const memberWorkloads = members
    .filter((m: any) => m.userId)
    .map((m: any) => {
      const activeTasks = rawTasks.filter(
        (t: any) =>
          t.assignedTo?._id?.toString() === m.userId?._id?.toString() &&
          t.status !== "done"
      ).length;

      return {
        memberId: m._id,
        userId: m.userId?._id,
        name: m.userId?.name || m.inviteEmail,
        email: m.userId?.email || m.inviteEmail,
        role: m.role,
        jobTitle: m.jobTitle,
        department: m.departmentId,
        activeTasks,
        capacityHours: m.capacityWeeklyHours || 40,
      };
    });

  // Separate intake (unassigned) tasks vs assigned sprint tasks
  const intakeTasks = rawTasks.filter((t: any) => !t.assignedTo);
  const assignedTasks = rawTasks.filter((t: any) => Boolean(t.assignedTo));

  return {
    success: true,
    tasks: rawTasks,
    intakeTasks,
    assignedTasks,
    memberWorkloads,
  };
}

/**
 * UPDATE TASK STATUS (Todo <-> In Progress <-> Review <-> Blocked <-> Done)
 * Supports Jira-style Proof of Completion & Blocker Handshake
 */
export async function updateDepartmentTaskStatusService(
  userId: string,
  taskId: string,
  data: {
    status: "todo" | "inprogress" | "review" | "blocked" | "done";
    proofUrl?: string;
    completionNotes?: string;
    blockedByDeptId?: string | null;
    blockerReason?: string;
  }
) {
  await connectToDatabase();

  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: "Task not found" };

  if (task.isLocked && data.status !== "todo" && data.status !== "blocked") {
    throw {
      status: 400,
      message: "This task is locked pending dependency completion. Complete the dependent task first.",
    };
  }

  const oldStatus = task.status;
  task.status = data.status;

  if (data.status === "done") {
    task.completedAt = new Date();
    if (data.proofUrl) task.proofUrl = data.proofUrl.trim();
    if (data.completionNotes) task.completionNotes = data.completionNotes.trim();

    // 🔗 Auto-resolve linked ticket if this task originated from a query / ticket!
    if (task.linkedTicketId) {
      await TeamTicket.findByIdAndUpdate(task.linkedTicketId, {
        $set: {
          status: "resolved",
          resolvedAt: new Date(),
          resolvedBy: new mongoose.Types.ObjectId(userId),
          resolutionSummary:
            data.completionNotes ||
            `Resolved automatically upon completion of task '${task.title}'. Deliverable proof: ${data.proofUrl || "Attached to task."}`,
        },
      });

      try {
        const linkedTicket = await TeamTicket.findById(task.linkedTicketId).lean();
        if (linkedTicket?.createdBy) {
          await Notification.create({
            userId: linkedTicket.createdBy,
            title: "Query / Ticket Resolved! ✅",
            message: `Ticket #${linkedTicket.ticketCode} (${linkedTicket.title}) was resolved with proof upon completion of task '${task.title}'.`,
            link: "/dashboard/team/tickets",
          });
        }
      } catch {}
    }

    // 🔗 Cross-Department Dependency Handshake: Unlock any tasks waiting on this task!
    const unlocked = await Task.find({ dependencyTaskId: task._id, isLocked: true });
    if (unlocked.length > 0) {
      await Task.updateMany(
        { dependencyTaskId: task._id, isLocked: true },
        { $set: { isLocked: false } }
      );

      for (const unl of unlocked) {
        if (unl.assignedTo) {
          try {
            await Notification.create({
              userId: unl.assignedTo,
              title: "Dependency Cleared! 🚀",
              message: `'${task.title}' was completed. Your task '${unl.title}' is now unlocked.`,
              link: "/dashboard/team",
            });
          } catch {}
        }
      }
    }
  } else {
    // If reverted away from done (e.g. back to inprogress or todo)
    task.completedAt = null;
    if (task.linkedTicketId && oldStatus === "done") {
      await TeamTicket.findByIdAndUpdate(task.linkedTicketId, {
        $set: {
          status: "in_progress",
          resolvedAt: null,
          resolvedBy: null,
        },
      });
    }
  }

  if (data.status === "blocked") {
    if (data.blockedByDeptId) {
      task.blockedByDeptId = new mongoose.Types.ObjectId(data.blockedByDeptId);
    }
    if (data.blockerReason) {
      task.blockerReason = data.blockerReason.trim();
    }

    // Notify lead of the blocking department
    if (data.blockedByDeptId) {
      const blockingDept = await Department.findById(data.blockedByDeptId).lean();
      if (blockingDept?.leadId) {
        try {
          await Notification.create({
            userId: blockingDept.leadId,
            title: "🚨 Blocker Raised on Your Department",
            message: `Task '${task.title}' is blocked waiting on ${blockingDept.name}. Blocker: ${data.blockerReason || "Action required"}`,
            link: "/dashboard/team",
          });
        } catch {}
      }
    }
  } else if (oldStatus === "blocked") {
    // Blocker resolved / cleared
    task.blockedByDeptId = null;
    task.blockerReason = "";
  }

  await task.save();

  const populated = await Task.findById(taskId)
    .populate("assignedTo", "name email profileImage")
    .populate("createdBy", "name email profileImage")
    .populate("departmentId", "name code color icon leadId")
    .populate({ path: "sourceDepartmentId", select: "name code color", strictPopulate: false })
    .populate({ path: "blockedByDeptId", select: "name code color", strictPopulate: false })
    .populate("dependencyTaskId", "title status")
    .lean();

  return {
    success: true,
    message:
      data.status === "done"
        ? "Task marked done & dependent handshakes unlocked!"
        : data.status === "blocked"
        ? "Task marked as blocked. Department lead notified."
        : `Task moved to ${data.status.toUpperCase()}.`,
    task: populated,
  };
}

/**
 * ADD TASK COMMENT / ACTIVITY
 */
export async function addTaskCommentService(
  userId: string,
  taskId: string,
  text: string
) {
  await connectToDatabase();

  const user = await User.findById(userId).select("name profileImage").lean();
  if (!user) throw { status: 404, message: "User not found" };

  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: "Task not found" };

  const newComment = {
    userId: new mongoose.Types.ObjectId(userId),
    userName: user.name || "Member",
    userImage: user.profileImage || "",
    text: text.trim(),
    createdAt: new Date(),
  };

  task.comments.push(newComment);
  await task.save();

  return {
    success: true,
    message: "Comment added.",
    comment: newComment,
  };
}

/**
 * REMOVE A MEMBER FROM ORG
 */
export async function removeOrgMemberService(
  userId: string,
  orgId: string,
  memberId: string
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const caller = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const isOwner = org.ownerId.toString() === userId || caller?.role === "owner";
  const isAdmin = caller?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw { status: 403, message: "Only organization owners and admins can remove members." };
  }

  const member = await OrgMember.findById(memberId);
  if (!member) throw { status: 404, message: "Member record not found" };

  // Rule 1: The Owner can NEVER be removed from the team directory
  if (
    member.role === "owner" ||
    member.userId?.toString() === org.ownerId.toString()
  ) {
    throw {
      status: 400,
      message: "The Organization Owner cannot be removed from the team directory. To disband the team, delete the organization project.",
    };
  }

  // Rule 2: Cannot remove yourself from directory
  if (member.userId?.toString() === userId) {
    throw {
      status: 400,
      message: "You cannot remove yourself from the team directory. To leave or disband, the owner can delete the organization project.",
    };
  }

  // Rule 3: Admin cannot remove other Admins or Owner
  if (!isOwner && (member.role === "admin" || member.role === "owner")) {
    throw {
      status: 403,
      message: "Admins cannot remove other Admins or the Owner.",
    };
  }

  // Clean up any lead role or task assignments for this member
  if (member.userId) {
    await Department.updateMany(
      { orgId: org._id, leadId: member.userId },
      { $set: { leadId: null } }
    );
    // Unassign tasks assigned to this user so they safely enter the department intake queue
    await Task.updateMany(
      { orgId: org._id, assignedTo: member.userId },
      { $set: { assignedTo: null } }
    );
  }

  await OrgMember.findByIdAndDelete(memberId);

  return {
    success: true,
    message: "Member removed from organization.",
  };
}

/**
 * DELETE AN ENTIRE ORGANIZATION / PROJECT (CASCADE)
 * Only the Organization Owner can perform this action.
 * Cascades across all members, departments, tasks, tickets, messages, and standup pulses.
 */
export async function deleteOrganizationService(userId: string, orgId: string) {
  await connectToDatabase();

  const org = await Organization.findById(orgId);
  if (!org) throw { status: 404, message: "Organization not found" };

  if (org.ownerId.toString() !== userId) {
    throw { status: 403, message: "Only the organization founder / owner can delete this project." };
  }

  const orgObjectId = new mongoose.Types.ObjectId(orgId);

  // 1. Remove all members from this project
  await OrgMember.deleteMany({ orgId: orgObjectId });

  // 2. Remove all departments
  await Department.deleteMany({ orgId: orgObjectId });

  // 3. Remove all department tasks
  await Task.deleteMany({ orgId: orgObjectId });

  // 4. Remove all tickets & queries
  await TeamTicket.deleteMany({ orgId: orgObjectId });

  // 5. Remove all team messages
  await TeamMessage.deleteMany({ orgId: orgObjectId });

  // 6. Remove all daily standup pulses
  await DailyPulse.deleteMany({ orgId: orgObjectId });

  // 7. Finally delete the organization record
  await Organization.findByIdAndDelete(orgId);

  return {
    success: true,
    message: "Organization project and all associated workspaces, members, and data have been permanently deleted.",
  };
}

/**
 * DELETE DEPARTMENT TASK
 * Allowed for Owner, Admin, Department Lead of that task's department, or the task creator.
 */
export async function deleteDepartmentTaskService(userId: string, taskId: string) {
  await connectToDatabase();

  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: "Task not found" };

  const org = await Organization.findById(task.orgId).lean();
  const caller = await OrgMember.findOne({
    orgId: task.orgId,
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  const dept = await Department.findById(task.departmentId).lean();

  const isOwner = org?.ownerId?.toString() === userId || caller?.role === "owner";
  const isAdmin = caller?.role === "admin";
  const isDeptLead = dept?.leadId?.toString() === userId;
  const isCreator = task.createdBy?.toString() === userId;

  if (!isOwner && !isAdmin && !isDeptLead && !isCreator) {
    throw {
      status: 403,
      message: "You do not have permission to delete this task. Only Admins, Department Leads, or the task creator can delete it.",
    };
  }

  // If this task was linked to a ticket, unlink it
  if (task.linkedTicketId) {
    await TeamTicket.findByIdAndUpdate(task.linkedTicketId, {
      $set: { convertedTaskId: null },
    });
  }

  // Unlock any tasks waiting on this deleted task so dependencies don't get stuck forever
  await Task.updateMany(
    { dependencyTaskId: task._id },
    { $set: { isLocked: false, dependencyTaskId: null } }
  );

  await Task.findByIdAndDelete(taskId);

  return {
    success: true,
    message: `Task '${task.title}' was deleted.`,
  };
}
