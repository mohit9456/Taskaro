import mongoose from "mongoose";

const HabitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      enum: ["health", "fitness", "productivity", "mindfulness", "learning", "lifestyle"],
      default: "health",
    },

    frequency: {
      type: String,
      enum: ["daily", "weekdays", "weekends", "custom"],
      default: "daily",
    },

    customDays: {
      type: [String],
      default: [], // e.g. ["Mon", "Wed", "Fri"]
    },

    targetCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    unit: {
      type: String,
      default: "times", // e.g. "times", "mins", "glasses", "pages"
      trim: true,
    },

    timeOfDay: {
      type: String,
      enum: ["anytime", "morning", "afternoon", "evening", "night"],
      default: "anytime",
    },

    streak: {
      type: Number,
      default: 0,
      min: 0,
    },

    bestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedDates: {
      type: [String], // Array of YYYY-MM-DD
      default: [],
      index: true,
    },

    reminderTime: {
      type: String, // HH:mm
      default: "",
    },

    color: {
      type: String,
      default: "#3b82f6",
    },

    icon: {
      type: String,
      default: "flame",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Habit: any = mongoose.models.Habit || mongoose.model("Habit", HabitSchema);
export default Habit;
