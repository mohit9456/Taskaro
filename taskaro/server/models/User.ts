import mongoose from "mongoose";

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
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    resetPasswordOTP: {
      type: String,
    },

    resetPasswordOTPExpiry: {
      type: Date,
    },
    fcmToken: {
      type: String,
          default: null,
    },
  },
  { timestamps: true },
);

const User: any = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
