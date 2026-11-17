import mongoose from "mongoose";

const OrgMemberSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    inviteEmail: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "lead", "member"],
      default: "member",
    },
    jobTitle: {
      type: String,
      default: "Team Member",
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "invited", "declined", "suspended"],
      default: "active",
    },
    capacityWeeklyHours: {
      type: Number,
      default: 40,
    },
    inviteToken: {
      type: String,
      default: null,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One membership per user/email per org
OrgMemberSchema.index({ orgId: 1, inviteEmail: 1 }, { unique: true });

const OrgMember: any =
  mongoose.models.OrgMember ||
  mongoose.model("OrgMember", OrgMemberSchema);

export default OrgMember;
