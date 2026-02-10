const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    about: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }], // Reference to Team
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    resetPasswordOTP: {
      type: String,
    },

    resetPasswordOTPExpiry: {
      type: Date,
    },
    fcmToken: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
