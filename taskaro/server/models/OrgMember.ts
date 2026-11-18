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
      enum: ["owner", "admin", "lead", "member"],
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
  { timestamps: true, strictPopulate: false }
);

// One membership per user/email per org
OrgMemberSchema.index({ orgId: 1, inviteEmail: 1 }, { unique: true });

if (mongoose.models.OrgMember) {
  delete (mongoose.models as any).OrgMember;
}

const OrgMember: any = mongoose.model("OrgMember", OrgMemberSchema);

export default OrgMember;
