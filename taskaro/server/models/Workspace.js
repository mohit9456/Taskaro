import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    planType: { type: String, enum: ["FREE", "PAID"], default: "FREE" },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    limits: {
      maxMembers: { type: Number, default: 1 },
      maxProjects: { type: Number, default: 1 },
      maxTasks: { type: Number, default: 0 },
    },

    permissions: {
      canInviteMembers: { type: Boolean, default: false },
      canAssignOthers: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
    },

    status: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export default mongoose.models.Workspace ||
  mongoose.model("Workspace", WorkspaceSchema);
