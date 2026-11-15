import mongoose from "mongoose";

const AlarmSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    repeat: {
      type: String,
      default: "Everyday",
    },

    customDays: {
      type: [String],
      default: [],
    },

    message: String,

    purpose: {
      label: String,
      emoji: String,
      color: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Alarm: any = mongoose.models.Alarm || mongoose.model("Alarm", AlarmSchema);
export default Alarm;
