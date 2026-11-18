import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      default: "GEN",
    },
    description: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#6366f1", // Indigo default
    },
    icon: {
      type: String,
      default: "Briefcase",
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    defaultSlaHours: {
      type: Number,
      default: 24,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strictPopulate: false }
);

// Compound index to ensure department name is unique per organization
DepartmentSchema.index({ orgId: 1, name: 1 }, { unique: true });

if (mongoose.models.Department) {
  delete (mongoose.models as any).Department;
}

const Department: any = mongoose.model("Department", DepartmentSchema);

export default Department;
