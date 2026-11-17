import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongodb";
import TeamTicket from "../models/TeamTicket";
import Department from "../models/Department";
import OrgMember from "../models/OrgMember";
import User from "../models/User";

/**
 * Calculate SLA deadline from hours
 */
function calculateDeadline(hours: number): Date {
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
}

/**
 * CREATE A CROSS-DEPARTMENT QUERY OR BLOCKER TICKET
 */
export async function createTicketService(
  userId: string,
  data: {
    orgId: string;
    title: string;
    description?: string;
    type?: "query" | "blocker" | "asset_request" | "bug_report" | "review_request";
    priority?: "low" | "medium" | "high" | "urgent_blocker";
    sourceDeptId: string;
    targetDeptId: string;
    tags?: string[];
    attachments?: string[];
  }
) {
  await connectToDatabase();

  const targetDept = await Department.findById(data.targetDeptId).lean();
  if (!targetDept) throw { status: 404, message: "Target department not found" };

  const sourceDept = await Department.findById(data.sourceDeptId).lean();
  if (!sourceDept) throw { status: 404, message: "Source department not found" };

  // Calculate ticket count for sequential code
  const count = await TeamTicket.countDocuments({
    orgId: new mongoose.Types.ObjectId(data.orgId),
    targetDeptId: new mongoose.Types.ObjectId(data.targetDeptId),
  });
  const deptCode = targetDept.code || "TCK";
  const ticketCode = `${deptCode}-${String(count + 1).padStart(3, "0")}`;

  // Determine SLA hours based on priority or department setting
  let slaHours = targetDept.defaultSlaHours || 24;
  if (data.priority === "urgent_blocker") slaHours = 4;
  else if (data.priority === "high") slaHours = 12;
  else if (data.priority === "low") slaHours = 48;

  const slaDeadline = calculateDeadline(slaHours);
  const isUrgent = data.priority === "urgent_blocker" || data.type === "blocker";

  const ticket = await TeamTicket.create({
    orgId: new mongoose.Types.ObjectId(data.orgId),
    ticketCode,
    title: data.title.trim(),
    description: data.description || "",
    type: data.type || "query",
    priority: data.priority || "medium",
    status: isUrgent ? "escalated" : "open",
    sourceDeptId: new mongoose.Types.ObjectId(data.sourceDeptId),
    targetDeptId: new mongoose.Types.ObjectId(data.targetDeptId),
    createdBy: new mongoose.Types.ObjectId(userId),
    assignedLeadId: targetDept.leadId || null,
    slaDeadline,
    isEscalated: isUrgent,
    escalatedAt: isUrgent ? new Date() : null,
    escalationReason: isUrgent ? "Initiated as Urgent Blocker" : "",
    tags: data.tags || [],
    attachments: data.attachments || [],
  });

  return {
    success: true,
    message: isUrgent ? "Urgent Blocker Ticket raised & escalated to Lead." : "Query ticket created successfully.",
    ticket,
  };
}

/**
 * LIST TICKETS WITH FILTERS & SLA STATUS
 */
export async function listTicketsService(
  userId: string,
  orgId: string,
  filters: {
    status?: string;
    priority?: string;
    type?: string;
    targetDeptId?: string;
    sourceDeptId?: string;
    isEscalated?: boolean;
    search?: string;
  }
) {
  await connectToDatabase();

  const query: any = { orgId: new mongoose.Types.ObjectId(orgId) };

  if (filters.status && filters.status !== "all") query.status = filters.status;
  if (filters.priority && filters.priority !== "all") query.priority = filters.priority;
  if (filters.type && filters.type !== "all") query.type = filters.type;
  if (filters.targetDeptId) query.targetDeptId = new mongoose.Types.ObjectId(filters.targetDeptId);
  if (filters.sourceDeptId) query.sourceDeptId = new mongoose.Types.ObjectId(filters.sourceDeptId);
  if (typeof filters.isEscalated === "boolean") query.isEscalated = filters.isEscalated;

  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: "i" } },
      { ticketCode: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
    ];
  }

  const rawTickets = await TeamTicket.find(query)
    .populate("sourceDeptId", "name code color icon")
    .populate("targetDeptId", "name code color icon")
    .populate("createdBy", "name email profileImage")
    .populate("assignedLeadId", "name email profileImage")
    .populate("assignedMemberId", "name email profileImage")
    .populate("resolvedBy", "name email profileImage")
    .sort({ isEscalated: -1, createdAt: -1 })
    .lean();

  const now = new Date();
  const tickets = rawTickets.map((t: any) => {
    const isOverdue = t.status !== "resolved" && t.status !== "closed" && t.slaDeadline && new Date(t.slaDeadline) < now;
    return {
      ...t,
      isOverdue: Boolean(isOverdue),
      slaRemainingHours: t.slaDeadline
        ? Math.max(0, Math.round((new Date(t.slaDeadline).getTime() - now.getTime()) / (1000 * 60 * 60)))
        : null,
    };
  });

  return {
    success: true,
    tickets,
  };
}

/**
 * UPDATE TICKET STATUS / ASSIGN / RESOLVE
 */
export async function updateTicketService(
  userId: string,
  ticketId: string,
  data: {
    status?: "open" | "in_progress" | "resolved" | "escalated" | "closed";
    assignedMemberId?: string;
    resolutionSummary?: string;
    priority?: "low" | "medium" | "high" | "urgent_blocker";
  }
) {
  await connectToDatabase();

  const ticket = await TeamTicket.findById(ticketId);
  if (!ticket) throw { status: 404, message: "Ticket not found" };

  if (data.status) {
    ticket.status = data.status;
    if (data.status === "resolved") {
      ticket.resolvedAt = new Date();
      ticket.resolvedBy = new mongoose.Types.ObjectId(userId);
      if (data.resolutionSummary) ticket.resolutionSummary = data.resolutionSummary;
      ticket.isEscalated = false;
    } else if (data.status === "escalated") {
      ticket.isEscalated = true;
      ticket.escalatedAt = new Date();
      ticket.escalationReason = data.resolutionSummary || "Manual Lead Escalation";
    }
  }

  if (data.assignedMemberId) {
    ticket.assignedMemberId = new mongoose.Types.ObjectId(data.assignedMemberId);
    if (ticket.status === "open") ticket.status = "in_progress";
  }

  if (data.priority) {
    ticket.priority = data.priority;
  }

  await ticket.save();

  const updatedTicket = await TeamTicket.findById(ticketId)
    .populate("sourceDeptId", "name code color")
    .populate("targetDeptId", "name code color")
    .populate("createdBy", "name email profileImage")
    .populate("assignedLeadId", "name email profileImage")
    .populate("assignedMemberId", "name email profileImage")
    .populate("resolvedBy", "name email profileImage")
    .lean();

  return {
    success: true,
    message: "Ticket updated successfully.",
    ticket: updatedTicket,
  };
}

/**
 * SCAN AND AUTO-ESCALATE OVERDUE SLA TICKETS
 */
export async function checkAndEscalateBreachedTicketsService(orgId: string) {
  await connectToDatabase();

  const now = new Date();
  const breachedTickets = await TeamTicket.updateMany(
    {
      orgId: new mongoose.Types.ObjectId(orgId),
      slaDeadline: { $lt: now },
      status: { $in: ["open", "in_progress"] },
      isEscalated: false,
    },
    {
      $set: {
        isEscalated: true,
        status: "escalated",
        escalatedAt: now,
        escalationReason: "Automated SLA Deadline Breach Pulse",
      },
    }
  );

  return {
    success: true,
    escalatedCount: breachedTickets.modifiedCount,
  };
}
