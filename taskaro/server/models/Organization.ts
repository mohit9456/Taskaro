import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    tier: {
      type: String,
      enum: ["pro", "enterprise"],
      default: "pro",
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
    settings: {
      allowMemberInvitesByLead: {
        type: Boolean,
        default: true,
      },
      defaultTicketSlaHours: {
        type: Number,
        default: 24,
      },
      enableAsyncDailyPulse: {
        type: Boolean,
        default: true,
      },
      enableBlockerAlarmEscalation: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const Organization: any =
  mongoose.models.Organization ||
  mongoose.model("Organization", OrganizationSchema);

export default Organization;
