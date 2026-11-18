import mongoose from "mongoose";

const TeamTicketSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    ticketCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["query", "blocker", "asset_request", "bug_report", "review_request"],
      default: "query",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent_blocker"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "escalated", "closed"],
      default: "open",
    },
    sourceDeptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    targetDeptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    slaDeadline: {
      type: Date,
      default: null,
    },
    isEscalated: {
      type: Boolean,
      default: false,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalationReason: {
      type: String,
      default: "",
    },
    resolutionSummary: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    // 🔗 Interconnection: Converted Department Task
    convertedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
  },
  { timestamps: true, strictPopulate: false }
);

TeamTicketSchema.index({ orgId: 1, ticketCode: 1 }, { unique: true });

if (mongoose.models.TeamTicket) {
  delete (mongoose.models as any).TeamTicket;
}

const TeamTicket: any = mongoose.model("TeamTicket", TeamTicketSchema);

export default TeamTicket;
