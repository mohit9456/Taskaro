// app/checkout/page.jsx
"use client";

import { Api, protectedApiGet, protectedApiPost } from "@/lib/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const PLAN_LEVEL = { free: 0, pro: 1, enterprise: 2 };
const PRICES = {
  monthly: { free: 0, pro: 850, enterprise: 1750 },
  yearly: { free: 0, pro: 8415, enterprise: 16915 },
};

const daysBetween = (start, end) =>
  Math.ceil((end - start) / (1000 * 60 * 60 * 24));

const getCycleDays = (startDate, endDate) =>
  daysBetween(new Date(startDate), new Date(endDate));

const CheckoutPage = () => {
  const router = useRouter();
  const [plan, setPlan] = useState(null);
  const [interval, setInterval] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unusedCredit, setUnusedCredit] = useState(0);
  const [features, setFeatures] = useState([]);

  const [currentSub, setCurrentSub] = useState(null);
  const [payNow, setPayNow] = useState(0);

  const { data: session, update } = useSession();

  useEffect(() => {
    const raw = sessionStorage.getItem("checkoutData");

    if (!raw || raw == null) {
      return router.replace("/pricing");
    }

    const parsed = JSON.parse(raw);

    setPlan(parsed?.plan);
    setInterval(parsed?.interval);

    // Set the price based on plan and interval
    let price = 0;
    if (
      (parsed?.plan !== "free" &&
        parsed?.plan !== "pro" &&
        parsed?.plan !== "enterprise") ||
      (parsed?.interval !== "yearly" && parsed?.interval !== "monthly")
    ) {
      return router.replace("/pricing");
    }

    if (parsed?.interval === "yearly") {
      if (parsed?.plan === "free") {
        price = 0; // ₹0/year
      } else if (parsed?.plan === "pro") {
        price = 8415; // ₹8,415/year
      } else if (parsed?.plan === "enterprise") {
        price = 16915; // ₹16,915/year
      }
    } else if (parsed?.interval === "monthly") {
      if (parsed?.plan === "free") {
        price = 0; // ₹0/month
      } else if (parsed?.plan === "pro") {
        price = 850; // ₹850/month
      } else if (parsed?.plan === "enterprise") {
        price = 1750; // ₹1,750/month
      }
    }
    // Set plan features based on selected plan
    if (parsed?.plan === "free") {
      setFeatures([
        "25 requests per minute",
        "Basic analytics dashboard",
        "Email support",
        "Limited API access",
      ]);
    } else if (parsed?.plan === "pro") {
      setFeatures([
        "100 requests per minute",
        "Advanced analytics",
        "Priority email support",
        "Full API access",
        "Webhook integrations",
      ]);
    } else if (parsed?.plan === "enterprise") {
      setFeatures([
        "Unlimited requests",
        "Enterprise-grade analytics",
        "24/7 phone support",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solutions",
      ]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // get current paid sub
    if (!session) return;
    protectedApiGet("/secure/subscription-plan")
      .then((sub) => {
        if (sub?.paymentDetails?.currentPaymentStatus === "paid") {
          setCurrentSub(sub);
        }
      })
      .catch(() => setCurrentSub(null));
  }, [session]);

  useEffect(() => {
    if (!plan || !interval) return; // wait till checkoutData loaded

    const newPrice = PRICES[interval][plan];

    // if no current subscription ➝ normal flow
    if (!currentSub) {
      setPayNow(newPrice);
      return;
    }

    /* -------- UPGRADE CHECK -------- */
    const oldPlan = currentSub.planName.toLowerCase();
    const oldInterval = currentSub.paymentDetails.interval || "monthly";
    const isUpgradeTier = PLAN_LEVEL[plan] > PLAN_LEVEL[oldPlan];
    const isUpgradeDur =
      PLAN_LEVEL[plan] === PLAN_LEVEL[oldPlan] &&
      oldInterval === "monthly" &&
      interval === "yearly";

    if (!(isUpgradeTier || isUpgradeDur)) {
      toast.error("Downgrade not allowed");
      router.replace("/pricing");
      return;
    }

    /* -------- PRORATION -------- */
    const today = new Date();
    const endDate = new Date(currentSub.endDate);
    const startDate = new Date(currentSub.startDate);

    // total days of THIS billing cycle (real calendar days)
    const totalCycleDays = getCycleDays(startDate, endDate);

    // remaining days
    const daysLeft = Math.max(0, daysBetween(today, endDate));

    const currentPrice = PRICES[oldInterval][oldPlan];

    // unused value (accurate)
    const unusedCredit = (daysLeft / totalCycleDays) * currentPrice;

    setUnusedCredit(Number(unusedCredit.toFixed(2)));

    const payable = Math.max(0, newPrice - unusedCredit);
    setPayNow(Math.round(payable));
  }, [plan, interval, currentSub]);

  const handlePayment = async () => {
    if (!session?.user) return;
    setLoading(true);

    try {
      const data = await protectedApiPost("/secure/razorpay", {
        planName: plan,
        amount: payNow,
        interval,
        interval_count: 1,
      });

      console.log(data, "data");

      if (!data?.success) {
        toast.error("Failed to create subscription");
        return;
      }

      // ✅ FREE PLAN (amount = 0)
      if (payNow === 0) {
        toast.success("Plan activated successfully 🎉");
        sessionStorage.removeItem("checkoutData");
        router.push("/dashboard/checkout/success");
        return; // ⛔ STOP HERE
      }

      console.log("idrr pahuncha", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);

      // 💳 PAID PLAN (amount > 0)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "TASKARO – Streamline tasks, Elevate teams",
        description: "Subscription plan",
        image:
          "https://img.freepik.com/free-vector/flat-design-kanban-illustration_23-2149337644.jpg",
        order_id: data.orderId,

        handler: async (response) => {
          console.log("idrr aaya");

          try {
            const { data } = await Api.post(
              "/posttransaction",
              new URLSearchParams({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                upgradeFrom: currentSub?._id || "",
              }),
            );

            console.log(data, "data");
            if (data.success) {
              router.push("/dashboard/checkout/success");
              sessionStorage.removeItem("checkoutData");
            } else {
              router.push(
                "/dashboard/checkout/failure?reason=processing_error",
              );
            }
          } catch {
            router.push("/dashboard/checkout/failure?reason=processing_error");
          }
        },

        modal: {
          ondismiss: () => {
            // user manually closed Razorpay
            router.push("/dashboard/checkout/failure?reason=failed");
          },
          escape: true,
          backdropclose: false,
        },

        prefill: {
          name: session.user.name,
          email: session.user.email,
        },
        theme: { color: "#242424" },
      };

      if (typeof window !== "undefined" && window.Razorpay) {
        const paymentObject = new window.Razorpay(options);

        paymentObject.open();

        paymentObject.on("payment.failed", () => {
          paymentObject.close();
          router.push("/dashboard/checkout/failure?reason=failed");
        });
      } else {
        toast.error("Payment SDK not loaded. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.error ||
          "Payment process failed, try again later",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center p-4">
        <div className="bg-(--card-bg) rounded-xl shadow-lg overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="bg-blue-600 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              Confirm Your Purchase
            </h1>
          </div>

          {/* Plan Details */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </h2>
              <div>
                <p className="text-lg font-bold text-(--color-primary)">
                  {interval === "yearly"
                    ? `₹${payNow}/year`
                    : `₹${payNow}/month`}
                </p>
                {currentSub && (
                  <p className="text-xs text-(--color-desc)">
                    (includes ₹{unusedCredit.toFixed(0)} credit)
                  </p>
                )}
              </div>
            </div>
            <p className="text-sm text-(--color-desc) mb-4">
              Billed monthly • Cancel anytime
            </p>
          </div>

          {/* Features List */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold mb-3">Plan Features:</h3>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-5 w-5 mt-0.5 text-green-500 mr-2 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Button */}
          <div className="p-6">
            <button
              onClick={handlePayment}
              className="w-full px-6 py-3 bg-(--color-primary) text-white font-semibold rounded-lg hover:bg-(--color-secondary) transition flex items-center justify-center cursor-pointer"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              Buy Now with Razorpay
            </button>

            <p className="text-xs text-(--color-desc) mt-3 text-center">
              By clicking "Buy Now", you agree to our{" "}
              <Link
                className="underline-offset-2 underline"
                href="/terms-conditions"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                className="underline-offset-2 underline"
                href={"/privacy-policy"}
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
