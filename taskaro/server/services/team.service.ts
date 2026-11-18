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

  // Find orgs where user is owner OR member
  const memberships = await OrgMember.find({
    $or: [{ userId: new mongoose.Types.ObjectId(userId) }, { inviteEmail: user.email.toLowerCase() }],
    status: { $in: ["active", "invited"] },
  })
    .populate("orgId")
    .populate("departmentId", "name code color")
    .lean();

  const orgs = memberships.map((m: any) => ({
    org: m.orgId,
    membership: {
      role: m.role,
      jobTitle: m.jobTitle,
      department: m.departmentId,
      status: m.status,
    },
  }));

  return {
    success: true,
    organizations: orgs,
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

  if (!userMembership && org.ownerId.toString() !== userId) {
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
    .populate("departmentId", "name code color")
    .sort({ role: 1, createdAt: 1 })
    .lean();

  return {
    success: true,
    organization: org,
    myRole: userMembership?.role || (org.ownerId.toString() === userId ? "owner" : "member"),
    departments,
    members: members.map((m: any) => ({
      _id: m._id,
      user: m.userId || { name: m.inviteEmail.split("@")[0], email: m.inviteEmail, profileImage: null },
      role: m.role,
      jobTitle: m.jobTitle,
      status: m.status,
      department: m.departmentId,
      capacityWeeklyHours: m.capacityWeeklyHours,
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
 * APPOINT OR UPDATE DEPARTMENT LEAD
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

  if (org.ownerId.toString() !== userId) {
    const caller = await OrgMember.findOne({
      orgId: new mongoose.Types.ObjectId(orgId),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
    if (caller?.role !== "owner") {
      throw { status: 403, message: "Only organization owners can appoint department leads." };
    }
  }

  // Update department lead
  const dept = await Department.findByIdAndUpdate(
    departmentId,
    { leadId: new mongoose.Types.ObjectId(leadUserId) },
    { new: true }
  ).populate("leadId", "name email profileImage");

  if (!dept) throw { status: 404, message: "Department not found." };

  // Promote member to "lead" role in OrgMember
  await OrgMember.findOneAndUpdate(
    { orgId: new mongoose.Types.ObjectId(orgId), userId: new mongoose.Types.ObjectId(leadUserId) },
    { role: "lead", departmentId: new mongoose.Types.ObjectId(departmentId) }
  );

  return {
    success: true,
    message: "Department lead appointed successfully.",
    department: dept,
  };
}

/**
 * INVITE OR ADD TEAM MEMBER
 */
export async function inviteOrgMemberService(
  userId: string,
  orgId: string,
  data: {
    email: string;
    departmentId?: string;
    role?: "lead" | "member";
    jobTitle?: string;
  }
) {
  await connectToDatabase();

  const org = await Organization.findById(orgId).lean();
  if (!org) throw { status: 404, message: "Organization not found" };

  const inviter = await User.findById(userId).select("name email").lean();
  const email = data.email.trim().toLowerCase();

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

  // Upsert membership
  const member = await OrgMember.findOneAndUpdate(
    { orgId: new mongoose.Types.ObjectId(orgId), inviteEmail: email },
    {
      userId: targetUser ? targetUser._id : null,
      departmentId: data.departmentId ? new mongoose.Types.ObjectId(data.departmentId) : null,
      role: data.role || "member",
      jobTitle: data.jobTitle || (data.role === "lead" ? "Department Lead" : "Team Member"),
      status: targetUser ? "active" : "invited",
      inviteToken,
      invitedBy: new mongoose.Types.ObjectId(userId),
      joinedAt: new Date(),
    },
    { upsert: true, new: true }
  ).populate("userId", "name email profileImage");

  // Send invitation email with HTML template
  try {
    const roleLabel = data.role === "lead" ? "Department Lead" : "Team Member";
    const inviterName = inviter?.name || "Your Team Lead";

    await sendMailService({
      to: email,
      subject: `You've been invited to join ${org.name} on Taskaro`,
      text: `Hi there,\n\n${inviterName} has invited you to join ${org.name} as ${roleLabel} in ${deptName}.\n\nClick the link below to accept your invitation:\n${inviteLink}\n\nWelcome aboard,\nTeam Taskaro`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
          <div style="margin-bottom: 24px;">
            <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 8px;">You've Been Invited to Join ${org.name}</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Collaborate, track sprints, and eliminate blockers on Taskaro.</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #334155;">
              <strong>${inviterName}</strong> has invited you to collaborate in <strong>${org.name}</strong>.
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569;">
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
  } catch (emailErr) {
    console.error("Failed to send invite email via SMTP, link still active:", emailErr);
  }

  return {
    success: true,
    message: `Invitation generated and dispatched to ${email}.`,
    inviteLink,
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

  return {
    success: true,
    message: "Welcome to the team! You have successfully joined the organization.",
    orgId: member.orgId,
  };
}

/**
 * CREATE A DEPARTMENT TASK & DELEGATE TO MEMBER
 */
export async function createDepartmentTaskService(
  callerUserId: string,
  data: {
    orgId: string;
    departmentId: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    estimatedHours?: number;
    assignedTo: string;
    dependencyTaskId?: string;
  }
) {
  await connectToDatabase();

  if (!data.title || !data.title.trim()) {
    throw { status: 400, message: "Task title is required." };
  }

  // Determine if task starts in locked state
  let isLocked = false;
  if (data.dependencyTaskId) {
    const depTask = await Task.findById(data.dependencyTaskId).lean();
    if (depTask && depTask.status !== "done") {
      isLocked = true;
    }
  }

  const task = await Task.create({
    title: data.title.trim(),
    description: data.description?.trim() || "",
    status: "todo",
    priority: data.priority || "medium",
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
    assignedTo: new mongoose.Types.ObjectId(data.assignedTo),
    createdBy: new mongoose.Types.ObjectId(callerUserId),
    orgId: new mongoose.Types.ObjectId(data.orgId),
    departmentId: new mongoose.Types.ObjectId(data.departmentId),
    estimatedHours: data.estimatedHours || 2,
    dependencyTaskId: data.dependencyTaskId ? new mongoose.Types.ObjectId(data.dependencyTaskId) : null,
    isLocked,
  });

  // Create notification for assignee
  try {
    await Notification.create({
      userId: new mongoose.Types.ObjectId(data.assignedTo),
      title: "New Department Task Assigned",
      message: `You were assigned: '${task.title}'${isLocked ? " (Locked pending dependency)" : ""}`,
      link: "/dashboard/my-tasks",
    });
  } catch {}

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email profileImage")
    .populate("departmentId", "name code color")
    .lean();

  return {
    success: true,
    message: isLocked
      ? "Task created and locked pending dependency completion."
      : "Department task assigned successfully.",
    task: populated,
  };
}

/**
 * GET DEPARTMENT TASKS & MEMBER WORKLOAD METRICS
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

  if (departmentId && departmentId !== "all") {
    query.departmentId = new mongoose.Types.ObjectId(departmentId);
  }

  const rawTasks = await Task.find(query)
    .populate("assignedTo", "name email profileImage role")
    .populate("createdBy", "name email profileImage")
    .populate("departmentId", "name code color")
    .populate("dependencyTaskId", "title status")
    .sort({ createdAt: -1 })
    .lean();

  // Calculate members live workload in this org
  const members = await OrgMember.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    ...(departmentId && departmentId !== "all" ? { departmentId: new mongoose.Types.ObjectId(departmentId) } : {}),
  })
    .populate("userId", "name email profileImage")
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
        activeTasks,
        capacityHours: m.capacityWeeklyHours || 40,
      };
    });

  return {
    success: true,
    tasks: rawTasks,
    memberWorkloads,
  };
}

/**
 * UPDATE DEPARTMENT TASK STATUS & UNLOCK DEPENDENCIES
 */
export async function updateDepartmentTaskStatusService(
  userId: string,
  taskId: string,
  newStatus: "todo" | "inprogress" | "done"
) {
  await connectToDatabase();

  const task = await Task.findById(taskId);
  if (!task) throw { status: 404, message: "Task not found" };

  if (task.isLocked && newStatus !== "todo") {
    throw {
      status: 400,
      message: "This task is locked pending dependency completion. Complete the dependent task first.",
    };
  }

  task.status = newStatus;
  if (newStatus === "done") {
    task.completedAt = new Date();

    // 🔗 Cross-Department Dependency Handshake: Unlock any tasks waiting on this task!
    const unlocked = await Task.find({ dependencyTaskId: task._id, isLocked: true });
    if (unlocked.length > 0) {
      await Task.updateMany(
        { dependencyTaskId: task._id, isLocked: true },
        { $set: { isLocked: false } }
      );

      // Notify assignees of unlocked tasks
      for (const unl of unlocked) {
        try {
          await Notification.create({
            userId: unl.assignedTo,
            title: "Task Unlocked! 🚀",
            message: `Dependency '${task.title}' is completed. Your task '${unl.title}' is now unlocked and ready.`,
            link: "/dashboard/my-tasks",
          });
        } catch {}
      }
    }
  } else {
    task.completedAt = null;
  }

  await task.save();

  const populated = await Task.findById(taskId)
    .populate("assignedTo", "name email profileImage")
    .populate("departmentId", "name code color")
    .populate("dependencyTaskId", "title status")
    .lean();

  return {
    success: true,
    message: newStatus === "done" ? "Task marked done & dependent tasks unlocked!" : `Task moved to ${newStatus}.`,
    task: populated,
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

  if (org.ownerId.toString() !== userId && caller?.role !== "owner") {
    throw { status: 403, message: "Only organization owners can remove members." };
  }

  const member = await OrgMember.findById(memberId);
  if (!member) throw { status: 404, message: "Member record not found" };

  if (member.role === "owner") {
    throw { status: 400, message: "Cannot remove the Organization Owner." };
  }

  await OrgMember.findByIdAndDelete(memberId);

  return {
    success: true,
    message: "Member removed from organization.",
  };
}
