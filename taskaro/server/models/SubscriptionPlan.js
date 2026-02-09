const mongoose = require("mongoose");

const SubscriptionPlan = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: { type: String, required: true },
    interval: { type: String, required: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "upgraded", "downgraded"],
      default: "created",
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentProvider: { type: String }, // e.g., Stripe, Razorpay
    paymentDetails: {
      razorpaySubscriptionId: { type: String },
      razorpayPaymentId: { type: String },
      currentPaymentStatus: { type: String }, // e.g., 'created', 'paid', 'failed'
      amount: { type: Number }, // in smallest currency unit, e.g., paisa
      currency: { type: String, default: "INR" },
    },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlan);
