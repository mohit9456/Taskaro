import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongodb";
import DailyPulse from "../models/DailyPulse";
import OrgMember from "../models/OrgMember";

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
    focusTasks: string[];
    blockers?: string;
    hasBlocker?: boolean;
    estimatedHours?: number;
    energyScore?: number;
  }
) {
  await connectToDatabase();

  const date = getTodayString();
  const hasBlocker = Boolean(data.hasBlocker || (data.blockers && data.blockers.trim().length > 0));

  const pulse = await DailyPulse.findOneAndUpdate(
    {
      orgId: new mongoose.Types.ObjectId(data.orgId),
      userId: new mongoose.Types.ObjectId(userId),
      date,
    },
    {
      departmentId: new mongoose.Types.ObjectId(data.departmentId),
      focusTasks: data.focusTasks || [],
      blockers: data.blockers || "",
      hasBlocker,
      estimatedHours: data.estimatedHours || 8,
      energyScore: data.energyScore || 4,
      submittedAt: new Date(),
    },
    { upsert: true, new: true }
  ).populate("userId", "name email profileImage");

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
    .populate("userId", "name email profileImage")
    .lean();

  // Aggregate metrics
  const totalSubmissions = pulses.length;
  const totalEstimatedHours = pulses.reduce((acc: number, p: any) => acc + (p.estimatedHours || 0), 0);
  const activeBlockers = pulses.filter((p: any) => p.hasBlocker).length;
  const avgEnergy = totalSubmissions > 0
    ? Number((pulses.reduce((acc: number, p: any) => acc + (p.energyScore || 4), 0) / totalSubmissions).toFixed(1))
    : 5;

  return {
    success: true,
    date,
    stats: {
      totalSubmissions,
      totalEstimatedHours,
      activeBlockers,
      avgEnergy,
    },
    pulses,
  };
}
