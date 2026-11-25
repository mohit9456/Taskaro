import mongoose from "mongoose";

const DailyPulseSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    yesterdayTasks: [
      {
        type: String,
        trim: true,
      },
    ],
    focusTasks: [
      {
        type: String,
        trim: true,
      },
    ],
    blockers: {
      type: String,
      default: "",
    },
    hasBlocker: {
      type: Boolean,
      default: false,
    },
    blockedByDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: 8,
    },
    energyScore: {
      type: Number, // 1 to 5
      default: 4,
      min: 1,
      max: 5,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One pulse per user per date in an org
DailyPulseSchema.index({ orgId: 1, userId: 1, date: 1 }, { unique: true });

const DailyPulse: any =
  mongoose.models.DailyPulse ||
  mongoose.model("DailyPulse", DailyPulseSchema);

export default DailyPulse;
