import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongodb";
import Organization from "../models/Organization";
import Department from "../models/Department";
import OrgMember from "../models/OrgMember";
import User from "../models/User";
import SubscriptionPlan from "../models/SubscriptionPlan";

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

  const email = data.email.trim().toLowerCase();

  // Check if existing Taskaro registered user
  const targetUser = await User.findOne({ email }).lean();

  // Upsert membership
  const member = await OrgMember.findOneAndUpdate(
    { orgId: new mongoose.Types.ObjectId(orgId), inviteEmail: email },
    {
      userId: targetUser ? targetUser._id : null,
      departmentId: data.departmentId ? new mongoose.Types.ObjectId(data.departmentId) : null,
      role: data.role || "member",
      jobTitle: data.jobTitle || (data.role === "lead" ? "Department Lead" : "Team Member"),
      status: targetUser ? "active" : "invited",
      invitedBy: new mongoose.Types.ObjectId(userId),
      joinedAt: new Date(),
    },
    { upsert: true, new: true }
  ).populate("userId", "name email profileImage");

  return {
    success: true,
    message: targetUser
      ? `${targetUser.name || email} added to team successfully.`
      : `Invitation sent to ${email}.`,
    member,
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
