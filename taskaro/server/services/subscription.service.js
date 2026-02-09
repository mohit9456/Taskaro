import { connectToDatabase } from "../db/mongodb";
import SubscriptionPlan from "../models/SubscriptionPlan";
import User from "../models/User";
import shortid from "shortid";
import { razorpay } from "../utils/razorpay";
import Workspace from "../models/Workspace";

export async function subscriptionPlanService(email) {
  await connectToDatabase();

  const user = await User.findOne({ email: email }).select("_id");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Step 2: Get subscription by user ID
  const subscription = await SubscriptionPlan.findOne({
    user: user._id,
    status: "paid",
    "paymentDetails.currentPaymentStatus": "paid",
  });

  if (!subscription) {
    throw { status: 400, message: "No plans available for this user" };
  }

  return {
    _id: subscription?._id,
    subscribed: true,
    planName: subscription.planName,
    interval: subscription.interval,
    paymentDetails: subscription.paymentDetails,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
  };
}

export async function createSubscription({
  email,
  planName,
  amount,
  interval,
  interval_count,
}) {
  if (
    !planName ||
    amount === undefined ||
    amount === null ||
    !interval ||
    interval_count === undefined ||
    interval_count === null
  ) {
    throw {
      status: 400,
      message: "Missing required fields",
    };
  }

  await connectToDatabase();
  const user = await User.findOne({ email: email });
  if (!user) {
    throw {
      status: 400,
      message: "User not found in Database",
    };
  }

  const paidPlan = await SubscriptionPlan.findOne({
    user: user._id,
    status: "paid",
    planName,
    interval,
  });

  if (paidPlan) {
    throw {
      status: 400,
      message: "You already have this plan active",
    };
  }

  // 💰 Razorpay Order
  let order = null;

  if (amount > 0) {
    order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: shortid.generate(),
    });
  }

  // 📅 Subscription dates
  const startDate = new Date();
  const endDate = new Date(startDate);

  const months = interval === "yearly" ? 12 : 1;
  endDate.setMonth(endDate.getMonth() + months);

  const pendingPlan = await SubscriptionPlan.findOne({
    user: user._id,
    status: "created",
  });

  const status = amount === 0 ? "paid" : "created";

  if (pendingPlan) {
    await SubscriptionPlan.updateOne(
      { _id: pendingPlan._id },
      {
        planName,
        interval,
        startDate,
        endDate,
        status,
        paymentProvider: amount === 0 ? "free" : "razorpay",
        paymentDetails: {
          razorpaySubscriptionId: amount === 0 ? "free" : order.id,
          amount: amount === 0 ? 0 : order.amount,
          currency: "INR",
          currentPaymentStatus: status,
        },
      },
    );
  } else {
    await SubscriptionPlan.create({
      user: user._id,
      planName,
      interval,
      status,
      startDate,
      endDate,
      paymentProvider: amount === 0 ? "free" : "razorpay",
      paymentDetails:
        amount > 0
          ? {
              razorpaySubscriptionId: order.id,
              amount: order.amount,
              currency: "INR",
              currentPaymentStatus: "created",
            }
          : undefined,
    });
  }

  if (amount === 0) {
    await Workspace.create({
      ownerId: user._id,
      name: user?.name,
      planType: "FREE",
      subscriptionId: null,
      limits: { maxMembers: 1, maxProjects: 1, maxTasks: 1 },
    });
  }

  return {
    success: true,
    orderId: amount === 0 ? "free" : order.id,
    amount: amount === 0 ? 0 : order.amount,
  };
}

export async function fetchWorkspaceUser(email) {
  await connectToDatabase();

  const user = await User.findOne({ email: email }).select("_id");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Step 2: Get subscription by user ID
  const workspaceMember = await Workspace.findOne({
    ownerId: user._id,
  });

  if (!workspaceMember) {
    throw { status: 400, message: "No plans available for this user" };
  }

  return {
    workspaceMember,
  };
}
