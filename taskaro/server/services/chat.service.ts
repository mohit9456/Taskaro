import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongodb";
import TeamMessage from "../models/TeamMessage";
import OrgMember from "../models/OrgMember";

/**
 * SEND REAL-TIME TEAM MESSAGE
 */
export async function sendTeamMessageService(
  userId: string,
  data: {
    orgId: string;
    channelType: "department" | "direct" | "ticket";
    departmentId?: string;
    ticketId?: string;
    recipientId?: string;
    content: string;
    attachments?: { url: string; name: string; fileType: string }[];
  }
) {
  await connectToDatabase();

  if (!data.content || !data.content.trim()) {
    throw { status: 400, message: "Message content cannot be empty." };
  }

  // Ensure sender is a member of the org
  const isMember = await OrgMember.findOne({
    orgId: new mongoose.Types.ObjectId(data.orgId),
    userId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!isMember) {
    throw { status: 403, message: "You are not a member of this organization." };
  }

  const message = await TeamMessage.create({
    orgId: new mongoose.Types.ObjectId(data.orgId),
    channelType: data.channelType,
    departmentId: data.departmentId ? new mongoose.Types.ObjectId(data.departmentId) : null,
    ticketId: data.ticketId ? new mongoose.Types.ObjectId(data.ticketId) : null,
    senderId: new mongoose.Types.ObjectId(userId),
    recipientId: data.recipientId ? new mongoose.Types.ObjectId(data.recipientId) : null,
    content: data.content.trim(),
    attachments: data.attachments || [],
    readBy: [new mongoose.Types.ObjectId(userId)],
  });

  const populated = await TeamMessage.findById(message._id)
    .populate("senderId", "name email profileImage role")
    .populate("recipientId", "name email profileImage role")
    .lean();

  // ⚡ Non-blocking broadcast to Socket.io Server for instant real-time sync
  try {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4000";
    fetch(`${socketServerUrl}/api/broadcast-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: populated }),
    }).catch(() => {});
  } catch {}

  return {
    success: true,
    message: populated,
  };
}

/**
 * FETCH MESSAGES FOR A CHANNEL / DIRECT CONVERSATION / TICKET HUDDLE
 */
export async function getTeamMessagesService(
  userId: string,
  params: {
    orgId: string;
    channelType: "department" | "direct" | "ticket";
    departmentId?: string;
    ticketId?: string;
    recipientId?: string;
    limit?: number;
  }
) {
  await connectToDatabase();

  const query: any = {
    orgId: new mongoose.Types.ObjectId(params.orgId),
    channelType: params.channelType,
  };

  if (params.channelType === "department" && params.departmentId) {
    query.departmentId = new mongoose.Types.ObjectId(params.departmentId);
  } else if (params.channelType === "ticket" && params.ticketId) {
    query.ticketId = new mongoose.Types.ObjectId(params.ticketId);
  } else if (params.channelType === "direct" && params.recipientId) {
    // 1-on-1 direct message between caller and recipient
    const u1 = new mongoose.Types.ObjectId(userId);
    const u2 = new mongoose.Types.ObjectId(params.recipientId);
    query.$or = [
      { senderId: u1, recipientId: u2 },
      { senderId: u2, recipientId: u1 },
    ];
  }

  const limit = Math.min(params.limit || 50, 100);

  const rawMessages = await TeamMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "name email profileImage role")
    .lean();

  // Reverse so oldest appears first in the chat window
  const messages = rawMessages.reverse();

  // Mark unread messages as read by caller
  const unreadIds = rawMessages
    .filter((m: any) => !m.readBy?.some((id: any) => id.toString() === userId))
    .map((m: any) => m._id);

  if (unreadIds.length > 0) {
    await TeamMessage.updateMany(
      { _id: { $in: unreadIds } },
      { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }
    );
  }

  return {
    success: true,
    messages,
  };
}
