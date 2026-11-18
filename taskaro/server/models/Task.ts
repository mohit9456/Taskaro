import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["todo", "inprogress", "review", "blocked", "done"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🗑️ Trash system
    isTrashed: {
      type: Boolean,
      default: false,
    },

    trashedAt: {
      type: Date,
    },

    // 🏢 Pro Team & Organizational Integration
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
      index: true,
    },

    // Target executing department
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },

    // Cross-department request source (if work was requested from another dept)
    sourceDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    estimatedHours: {
      type: Number,
      default: 2,
    },

    // 🔗 Cross-Department Dependency Handshake & Blocker
    dependencyTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    blockedByDeptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    blockerReason: {
      type: String,
      default: "",
    },

    // 📎 Proof of Completion / Deliverable (Jira Reference)
    proofUrl: {
      type: String,
      default: "",
      trim: true,
    },

    completionNotes: {
      type: String,
      default: "",
    },

    // 🎫 Interconnected Ticket Reference
    linkedTicketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamTicket",
      default: null,
    },

    // 💬 Discussion & Activity Comments
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: {
          type: String,
          default: "Member",
        },
        userImage: {
          type: String,
          default: "",
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true, strictPopulate: false }
);

if (mongoose.models.Task) {
  delete (mongoose.models as any).Task;
}

const Task: any = mongoose.model("Task", TaskSchema);
export default Task;
