import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongodb";
import DailyPulse from "../models/DailyPulse";
import OrgMember from "../models/OrgMember";
import Department from "../models/Department";
import User from "../models/User";
import Task from "../models/Task";
import { sendTeamMessageService } from "./chat.service";
import { createNotificationService } from "./notification.service";

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * SUBMIT OR UPDATE 60-SECOND ASYNC DAILY PULSE
 */
export async function submitDailyPulseService(
  userId: string,
  data: {
    orgId: string;
    departmentId: string;
    yesterdayTasks?: string[];
    focusTasks: string[];
    blockers?: string;
    hasBlocker?: boolean;
    blockedByDepartmentId?: string | null;
    estimatedHours?: number;
    energyScore?: number;
  }
) {
  await connectToDatabase();

  const date = getTodayString();
  const hasBlocker = Boolean(
    data.hasBlocker ||
      (data.blockers && data.blockers.trim().length > 0) ||
      (data.blockedByDepartmentId && data.blockedByDepartmentId.trim().length > 0)
  );

  const pulse = await DailyPulse.findOneAndUpdate(
    {
      orgId: new mongoose.Types.ObjectId(data.orgId),
      userId: new mongoose.Types.ObjectId(userId),
      date,
    },
    {
      departmentId: new mongoose.Types.ObjectId(data.departmentId),
      yesterdayTasks: data.yesterdayTasks || [],
      focusTasks: data.focusTasks || [],
      blockers: data.blockers || "",
      hasBlocker,
      blockedByDepartmentId:
        data.blockedByDepartmentId && mongoose.Types.ObjectId.isValid(data.blockedByDepartmentId)
          ? new mongoose.Types.ObjectId(data.blockedByDepartmentId)
          : null,
      estimatedHours: data.estimatedHours || 8,
      energyScore: data.energyScore || 4,
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  )
    .populate("userId", "name email profileImage role")
    .populate("blockedByDepartmentId", "name color");

  return {
    success: true,
    message: "Daily Pulse recorded successfully.",
    pulse,
  };
}

/**
 * GET DEPARTMENT DAILY PULSE SUMMARY FOR A GIVEN DATE
 */
export async function getDepartmentDailyPulseService(
  userId: string,
  orgId: string,
  departmentId: string,
  dateStr?: string
) {
  await connectToDatabase();

  const date = dateStr || getTodayString();

  const pulses = await DailyPulse.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    departmentId: new mongoose.Types.ObjectId(departmentId),
    date,
  })
    .populate("userId", "name email profileImage role")
    .populate("blockedByDepartmentId", "name color")
    .sort({ submittedAt: -1 })
    .lean();

  // Fetch active department members to track attendance / missing check-ins
  const deptMembers = await OrgMember.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    departmentId: new mongoose.Types.ObjectId(departmentId),
    status: "active",
  })
    .populate("userId", "name email profileImage role")
    .lean();

  const submittedUserIds = new Set(
    pulses.map((p: any) => p.userId?._id?.toString()).filter(Boolean)
  );

  const missingMembers = deptMembers
    .filter((m: any) => m.userId && !submittedUserIds.has(m.userId._id.toString()))
    .map((m: any) => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role,
      jobTitle: m.jobTitle,
      profileImage: m.userId.profileImage,
    }));

  // Fetch recent tasks completed by current user in the last 48 hours for auto-import into yesterdayTasks
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const completedYesterdayTasks = await Task.find({
    orgId: new mongoose.Types.ObjectId(orgId),
    assignedTo: new mongoose.Types.ObjectId(userId),
    status: "done",
    $or: [
      { completedAt: { $gte: twoDaysAgo } },
      { updatedAt: { $gte: twoDaysAgo } },
    ],
  })
    .select("title completedAt")
    .limit(8)
    .lean();

  // Aggregate metrics
  const totalSubmissions = pulses.length;
  const totalDepartmentMembers = deptMembers.length;
  const submissionRate =
    totalDepartmentMembers > 0
      ? Math.round((totalSubmissions / totalDepartmentMembers) * 100)
      : 100;
  const totalEstimatedHours = pulses.reduce(
    (acc: number, p: any) => acc + (p.estimatedHours || 0),
    0
  );
  const activeBlockers = pulses.filter((p: any) => p.hasBlocker).length;
  const avgEnergy =
    totalSubmissions > 0
      ? Number(
          (
            pulses.reduce((acc: number, p: any) => acc + (p.energyScore || 4), 0) /
            totalSubmissions
          ).toFixed(1)
        )
      : 5;

  return {
    success: true,
    date,
    stats: {
      totalSubmissions,
      totalDepartmentMembers,
      submissionRate,
      totalEstimatedHours,
      activeBlockers,
      avgEnergy,
    },
    pulses,
    missingMembers,
    completedYesterdayTasks: completedYesterdayTasks.map((t: any) => t.title),
  };
}

/**
 * 1-CLICK BROADCAST STANDUP DIGEST TO DEPARTMENT TEAM CHAT
 */
export async function broadcastStandupDigestService(
  userId: string,
  orgId: string,
  departmentId: string,
  dateStr?: string
) {
  await connectToDatabase();
  const date = dateStr || getTodayString();

  const department = await Department.findById(departmentId).lean();
  if (!department) {
    throw { status: 404, message: "Department not found." };
  }

  const { stats, pulses } = await getDepartmentDailyPulseService(
    userId,
    orgId,
    departmentId,
    date
  );

  if (pulses.length === 0) {
    throw {
      status: 400,
      message: "No standup pulses submitted yet for today to broadcast.",
    };
  }

  // Format Standup Digest in clean Markdown
  let digest = `☀️ **Daily Async Standup Digest (${date})**\n`;
  digest += `📊 Attendance: ${stats.totalSubmissions}/${stats.totalDepartmentMembers} (${stats.submissionRate}%) | ⚡ Energy: ${stats.avgEnergy}/5 | ⏱️ Bandwidth: ${stats.totalEstimatedHours}h\n\n`;

  pulses.forEach((p: any) => {
    const userName = p.userId?.name || "Team Member";
    const blockerTag = p.hasBlocker
      ? ` ⚠️ *[Blocked${p.blockedByDepartmentId ? ` by ${p.blockedByDepartmentId.name}` : ""}: ${p.blockers || "Active blocker"}]*`
      : " ✅ *All Clear*";
    digest += `• **${userName}** (⚡${p.energyScore}/5, ${p.estimatedHours}h)${blockerTag}\n`;
    if (p.focusTasks && p.focusTasks.length > 0) {
      digest += `   🎯 Focus: ${p.focusTasks.join(", ")}\n`;
    }
  });

  // Post to team chat channel
  const chatResult = await sendTeamMessageService(userId, {
    orgId,
    channelType: "department",
    departmentId,
    content: digest,
  });

  return {
    success: true,
    message: "Standup digest posted to department chat!",
    chatMessage: chatResult.message,
  };
}

/**
 * NUDGE MEMBER TO LOG STANDUP VIA DIRECT MESSAGE
 */
export async function nudgeMemberStandupService(
  userId: string,
  targetUserId: string,
  orgId: string
) {
  await connectToDatabase();

  const user = await User.findById(userId).lean();
  const senderName = user?.name || "Team Lead";

  const nudgeContent = `👋 Hi! Reminder from **${senderName}**: Please take 60 seconds to log your **Daily Morning Pulse** in the Standup section so the team stays aligned today! 🚀`;

  const chatResult = await sendTeamMessageService(userId, {
    orgId,
    channelType: "direct",
    recipientId: targetUserId,
    content: nudgeContent,
  });

  // Also dispatch in-app notification
  createNotificationService({
    userId: targetUserId,
    title: "⚡ Morning Standup Reminder",
    message: `${senderName} reminded you to submit your 60-second morning pulse in Standup.`,
    type: "STANDUP_NUDGE",
    priority: "medium",
    link: "/dashboard/team/standup",
    metadata: { orgId },
  }).catch(() => {});

  return {
    success: true,
    message: "Nudge sent via direct chat!",
    chatMessage: chatResult.message,
  };
}
