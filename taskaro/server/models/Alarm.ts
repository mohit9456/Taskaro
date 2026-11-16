import mongoose from "mongoose";

const AlarmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    label: {
      type: String,
      default: "Alarm",
      trim: true,
    },

    time: {
      type: String,
      required: true, // "HH:mm"
    },

    repeat: {
      type: String,
      enum: ["Everyday", "Weekdays", "Custom", "Once"],
      default: "Everyday",
    },

    customDays: {
      type: [String],
      default: [], // e.g. ["Mon", "Wed", "Fri"]
    },

    message: {
      type: String,
      default: "",
    },

    purpose: {
      label: { type: String, default: "Wake Up" },
      emoji: { type: String, default: "⏰" },
      color: { type: String, default: "from-blue-500 to-indigo-600" },
    },

    sound: {
      type: String,
      enum: ["classic", "gentle-chime", "energetic", "radar"],
      default: "classic",
    },

    volume: {
      type: Number,
      default: 80,
      min: 10,
      max: 100,
    },

    snoozeDuration: {
      type: Number,
      default: 5, // minutes
    },

    challenge: {
      type: String,
      enum: ["none", "math", "quote"],
      default: "none",
    },

    vibration: {
      type: Boolean,
      default: true,
    },

    gradualVolume: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Alarm: any = mongoose.models.Alarm || mongoose.model("Alarm", AlarmSchema);
export default Alarm;
