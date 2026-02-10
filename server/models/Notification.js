// models/Notification.js
const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Notification",
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },

      title: String,
      message: String,

      type: {
        type: String,
      },

      isRead: { type: Boolean, default: false },
    },
    { timestamps: true },
  ),
);
