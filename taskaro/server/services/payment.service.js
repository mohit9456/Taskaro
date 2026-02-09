import crypto from "crypto";
import SubscriptionPlan from "../models/SubscriptionPlan";
import { getRazorpayAuthHeader } from "../utils/razorpayAuth";
import Workspace from "../models/Workspace";
import User from "../models/User";

export async function verifyAndProcessPayment({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  upgradeFrom,
  email,
}) {
  // 1️⃣ Verify signature FIRST
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    await markSubscriptionFailed(razorpay_order_id, "Invalid signature");
    throw { status: 400, message: "Invalid payment signature" };
  }

  // 2️⃣ Fetch payment from Razorpay
  let payment;

  await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
    method: "GET",
    headers: {
      Authorization: getRazorpayAuthHeader(),
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Razorpay API error (${response.status}): ${errorText}`,
        );
      }
      console.log("response", response);
      return response.json();
    })
    .then((data) => {
      console.log("data", data);
      payment = data;
    })
    .catch((error) => {
      console.error("Razorpay payment fetch failed:", error);

      throw {
        status: 502,
        message: "Unable to verify payment at the moment",
      };
    });

  //   const payment = await response.json();

  // 3️⃣ Handle payment states
  if (payment.error || payment.status === "failed") {
    await markSubscriptionFailed(
      razorpay_order_id,
      payment.error?.description || "Payment failed",
    );
    throw { status: 400, message: "Payment failed" };
  }

  if (payment.status === "cancelled") {
    await SubscriptionPlan.findOneAndUpdate(
      { "paymentDetails.razorpaySubscriptionId": razorpay_order_id },
      {
        status: "failed",
        "paymentDetails.currentPaymentStatus": "cancelled",
      },
    );
    throw { status: 400, message: "Payment cancelled" };
  }

  if (payment.status !== "captured") {
    throw {
      status: 400,
      message: `Payment processing (${payment.status})`,
    };
  }

  // 4️⃣ Upgrade logic
  if (upgradeFrom) {
    await SubscriptionPlan.findByIdAndUpdate(upgradeFrom, {
      status: "upgraded",
    });
  }

  // 5️⃣ Final success update
  const subscription = await SubscriptionPlan.findOneAndUpdate(
    { "paymentDetails.razorpaySubscriptionId": razorpay_order_id },
    {
      status: "paid",
      "paymentDetails.currentPaymentStatus": "paid",
      "paymentDetails.razorpayPaymentId": razorpay_payment_id,
      "paymentDetails.paidAt": new Date(),
    },
    { new: true },
  );

  if (!subscription) {
    throw { status: 404, message: "Subscription not found" };
  }

  const user = await User.findOne({ email: email }).select("_id");
  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  await Workspace.findOneAndUpdate(
    { ownerId: user._id }, // condition
    {
      $set: {
        name: user?.name,
        planType: "PAID",
        subscriptionId: subscription?._id,
        limits: {
          maxMembers: 100,
          maxProjects: 100,
          maxTasks: 1000,
        },
        permissions: {
          canInviteMembers: true,
          canAssignOthers: true,
          canViewAnalytics: true,
        },
      },
    },
    {
      new: true, // updated/new document return kare
      upsert: true, // agar nahi mila to create kare
      setDefaultsOnInsert: true,
    },
  );

  return { success: true };
}

// 🔧 helper
async function markSubscriptionFailed(orderId, reason) {
  await SubscriptionPlan.findOneAndUpdate(
    { "paymentDetails.razorpaySubscriptionId": orderId },
    {
      status: "failed",
      "paymentDetails.currentPaymentStatus": "failed",
      "paymentDetails.error": reason,
    },
  );
}
