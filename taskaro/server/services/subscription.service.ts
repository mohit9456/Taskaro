import crypto from "crypto";
import { connectToDatabase } from "../db/mongodb";
import SubscriptionPlan from "../models/SubscriptionPlan";
import User from "../models/User";
import Workspace from "../models/Workspace";
import shortid from "shortid";
import { razorpay } from "../utils/razorpay";

export const PLAN_PRICING: Record<string, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 849, yearly: 8388 }, // ₹849/mo, or ₹8,388/yr (₹699/mo)
  enterprise: { monthly: 1699, yearly: 16788 }, // ₹1,699/mo, or ₹16,788/yr
};

/**
 * GET CURRENT USER SUBSCRIPTION & TRANSACTION HISTORY
 */
export async function subscriptionPlanService(email: string) {
  await connectToDatabase();

  const user = await User.findOne({ email }).select("_id name email isPro plan subscriptionExpiresAt");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Active paid plan
  const activeSubscription = await SubscriptionPlan.findOne({
    user: user._id,
    status: "paid",
    "paymentDetails.currentPaymentStatus": "paid",
    endDate: { $gte: new Date() },
  }).sort({ createdAt: -1 });

  // If no active subscription found, check if user.isPro was manually flagged
  const isPro = Boolean(activeSubscription || user.isPro);
  const currentPlanName = activeSubscription ? activeSubscription.planName : (user.plan || "Free");

  // Fetch all payment history / transactions
  const rawTransactions = await SubscriptionPlan.find({
    user: user._id,
  })
    .sort({ createdAt: -1 })
    .limit(15);

  const transactions = rawTransactions.map((tx: any) => ({
    id: tx._id.toString(),
    planName: tx.planName,
    interval: tx.interval,
    status: tx.status,
    amount: tx.paymentDetails?.amount ? Math.round(tx.paymentDetails.amount / 100) : 0,
    currency: tx.paymentDetails?.currency || "INR",
    paymentId: tx.paymentDetails?.razorpayPaymentId || "—",
    orderId: tx.paymentDetails?.razorpaySubscriptionId || "—",
    date: tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—",
  }));

  return {
    success: true,
    subscribed: isPro && currentPlanName.toLowerCase() !== "free",
    isPro,
    planName: currentPlanName,
    interval: activeSubscription?.interval || "none",
    startDate: activeSubscription?.startDate || null,
    endDate: activeSubscription?.endDate || user.subscriptionExpiresAt || null,
    transactions,
  };
}

/**
 * CREATE RAZORPAY SUBSCRIPTION ORDER
 */
export async function createSubscription({
  email,
  planName = "pro",
  interval = "monthly",
}: {
  email: string;
  planName: string;
  interval: "monthly" | "yearly";
}) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const normalizedPlan = planName.toLowerCase();

  // Free plan is default
  if (normalizedPlan === "free") {
    return {
      success: true,
      isFree: true,
      message: "The Free Plan is permanently active by default.",
    };
  }

  // Check if user already has an active subscription for this plan
  const activeSub = await SubscriptionPlan.findOne({
    user: user._id,
    status: "paid",
    planName: new RegExp(`^${normalizedPlan}$`, "i"),
    endDate: { $gte: new Date() },
  });

  if (activeSub) {
    throw {
      status: 400,
      message: `You already have an active ${activeSub.planName} subscription valid until ${new Date(activeSub.endDate).toLocaleDateString()}.`,
    };
  }

  // Calculate price in INR (Rupees)
  const planRate = PLAN_PRICING[normalizedPlan];
  if (!planRate) {
    throw { status: 400, message: "Invalid plan selected" };
  }

  const priceInRupees = interval === "yearly" ? planRate.yearly : planRate.monthly;

  // Create Razorpay Order
  const orderReceipt = `rcpt_${shortid.generate()}`;
  const order = await razorpay.orders.create({
    amount: priceInRupees * 100, // paise
    currency: "INR",
    receipt: orderReceipt,
    notes: {
      userEmail: email,
      userId: user._id.toString(),
      plan: normalizedPlan,
      interval,
    },
  });

  const startDate = new Date();
  const endDate = new Date(startDate);
  const months = interval === "yearly" ? 12 : 1;
  endDate.setMonth(endDate.getMonth() + months);

  // Record pending subscription order
  await SubscriptionPlan.create({
    user: user._id,
    planName: normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1),
    interval,
    status: "created",
    startDate,
    endDate,
    paymentProvider: "razorpay",
    paymentDetails: {
      razorpaySubscriptionId: order.id,
      amount: order.amount,
      currency: "INR",
      currentPaymentStatus: "created",
    },
  });

  return {
    success: true,
    isFree: false,
    orderId: order.id,
    amount: order.amount,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    planName: normalizedPlan,
    interval,
  };
}

/**
 * CANCEL / ABORT RAZORPAY ORDER
 */
export async function cancelSubscriptionOrder({
  email,
  orderId,
  reason = "Cancelled by user",
}: {
  email: string;
  orderId: string;
  reason?: string;
}) {
  await connectToDatabase();

  const user = await User.findOne({ email }).select("_id");
  if (!user) return { success: false, message: "User not found" };

  await SubscriptionPlan.findOneAndUpdate(
    {
      user: user._id,
      "paymentDetails.razorpaySubscriptionId": orderId,
    },
    {
      status: "failed",
      "paymentDetails.currentPaymentStatus": "cancelled",
      "paymentDetails.error": reason,
    }
  );

  return { success: true, message: "Order cancelled successfully." };
}

/**
 * VERIFY PAYMENT AND ACTIVATE PRO MEMBERSHIP
 */
export async function verifyPaymentService({
  email,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  email: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // 1. Verify HMAC SHA256 Signature
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw { status: 500, message: "Payment gateway credentials not configured on server" };
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    await SubscriptionPlan.findOneAndUpdate(
      { "paymentDetails.razorpaySubscriptionId": razorpay_order_id },
      {
        status: "failed",
        "paymentDetails.currentPaymentStatus": "invalid_signature",
      }
    );
    throw { status: 400, message: "Invalid payment signature verification failed" };
  }

  // 2. Find and update the SubscriptionPlan
  const subscription = await SubscriptionPlan.findOneAndUpdate(
    {
      user: user._id,
      "paymentDetails.razorpaySubscriptionId": razorpay_order_id,
    },
    {
      status: "paid",
      "paymentDetails.currentPaymentStatus": "paid",
      "paymentDetails.razorpayPaymentId": razorpay_payment_id,
      "paymentDetails.paidAt": new Date(),
    },
    { new: true }
  );

  if (!subscription) {
    throw { status: 404, message: "Subscription order not found" };
  }

  // 3. Mark User as PRO in database
  user.isPro = true;
  user.plan = subscription.planName.toLowerCase();
  user.subscriptionExpiresAt = subscription.endDate;
  await user.save();

  // 4. Update Workspace limits if applicable
  await Workspace.findOneAndUpdate(
    { ownerId: user._id },
    {
      $set: {
        name: user.name,
        planType: "PAID",
        subscriptionId: subscription._id,
        limits: {
          maxMembers: 100,
          maxProjects: 100,
          maxTasks: 10000,
        },
      },
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    message: `Congratulations! Your ${subscription.planName} plan is now active.`,
    planName: subscription.planName,
    interval: subscription.interval,
    isPro: true,
    expiresAt: subscription.endDate,
  };
}

/**
 * FETCH WORKSPACE USER FOR MEMBERS
 */
export async function fetchWorkspaceUser(email: string) {
  await connectToDatabase();

  const user = await User.findOne({ email }).select("_id name");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  const workspaceMember = await Workspace.findOne({
    ownerId: user._id,
  });

  return {
    workspaceMember: workspaceMember || null,
  };
}

