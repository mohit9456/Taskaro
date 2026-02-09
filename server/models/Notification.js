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
