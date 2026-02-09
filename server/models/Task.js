const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Task",
  new mongoose.Schema(
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
        enum: ["todo", "inprogress", "done"],
        default: "todo",
      },

      priority: {
        type: String,
        enum: ["low", "medium", "high"],
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
        required: true,
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
    },
    { timestamps: true }, // createdAt, updatedAt
  ),
);
