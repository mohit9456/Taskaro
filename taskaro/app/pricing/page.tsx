"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { protectedApiGet } from "@/lib/api";
import Loader from "@/components/Loader";

const planLevels = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

const intervalLevels = {
  monthly: 0,
  yearly: 1,
};

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [isValidPlan, setIsValidPlan] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const pricing = {
    monthly: [
      {
        title: "Free",
        price: "$0",
        features: [
          "Create and manage 1 project workspace",
          "Track basic tasks with checklists",
          "Access to limited community support via email",
        ],
        cta: "Get Started",
      },
      {
        title: "Pro",
        price: "$10 /mo",
        features: [
          "Unlimited project creation and task assignments",
          "Collaborate with team members in real-time",
          "Priority email support for faster resolutions",
          "Access to task analytics & timelines",
          "Recurring tasks & deadline reminders",
        ],
        cta: "Buy Now",
      },
      {
        title: "Enterprise",
        price: "$20 /mo",
        features: [
          "Custom workflows tailored to your organization",
          "Advanced team analytics and productivity reports",
          "Dedicated account manager & 24/7 priority support",
          "Access control and role-based permissions",
          "Early access to beta features and updates",
        ],
        cta: "Buy Now",
      },
    ],
    annual: [
      {
        title: "Free",
        price: "$0",
        features: [
          "Create and manage 1 project workspace",
          "Track basic tasks with checklists",
          "Access to limited community support via email",
        ],
        cta: "Get Started",
      },
      {
        title: "Pro",
        price: "$99 /yr",
        features: [
          "Unlimited project creation and task assignments",
          "Collaborate with team members in real-time",
          "Priority email support for faster resolutions",
          "Access to task analytics & timelines",
          "Recurring tasks & deadline reminders",
        ],
        cta: "Buy Now",
      },
      {
        title: "Enterprise",
        price: "$199 /yr",
        features: [
          "Custom workflows tailored to your organization",
          "Advanced team analytics and productivity reports",
          "Dedicated account manager & 24/7 priority support",
          "Access control and role-based permissions",
          "Early access to beta features and updates",
        ],
        cta: "Buy Now",
      },
    ],
  };

  useEffect(() => {
    if (!session) return;
    protectedApiGet("/secure/subscription-plan")
      .then((data) => {
        if (data?.paymentDetails?.currentPaymentStatus === "paid") {
          return setIsValidPlan(data);
        }
        return setIsValidPlan(null);
      })
      .catch((err) => {
        // console.log(err);
        setIsValidPlan(null);
      });
  }, [session]);

  const handleBuy = (plan) => {
    if (!session) {
      toast.error("Please Login first to subscribe the Plans");
      router.push("/auth/login");
      return;
    }

    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        plan,
        interval: isAnnual ? "yearly" : "monthly",
        ts: Date.now(),
      }),
    );
    router.push(`/dashboard/checkout`);
  };

  const selectedPlans = isAnnual ? pricing.annual : pricing.monthly;

  if (status === "loading") {
    return (
      <div className="py-6 bg-[#f5f5f] min-h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <section className="py-6 bg-bg text-content">
      <div className="container mx-auto p-4 sm:p-10">
        <div className="mb-16 space-y-4 text-center">
          <h1 className="text-4xl font-semibold leading-tight">
            Pricing Plans
          </h1>
          <p className="px-4 sm:px-8 lg:px-24">
            Choose a plan that fits your team's needs. Pay monthly or save more
            with an annual subscription.
          </p>
          <div>
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1 font-semibold border rounded-l-lg ${
                !isAnnual
                  ? "bg-(--color-content) text-(--color-bg)"
                  : "border-(--color-content) text-(--color-content)"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1 border rounded-r-lg ${
                isAnnual
                  ? "bg-(--color-content) text-(--color-bg)"
                  : "border-(--color-content) text-(--color-content)"
              }`}
            >
              Annually
            </button>
          </div>
        </div>

        <div className="grid max-w-md grid-cols-1 gap-6 mx-auto auto-rows-fr lg:max-w-full lg:gap-4 xl:gap-6 lg:grid-cols-3">
          {selectedPlans.map((plan, index) => {
            const currentPlan = isValidPlan?.planName?.toLowerCase();
            const currentInterval = isValidPlan?.interval;

            const currentLevel = planLevels[currentPlan] ?? -1;
            const currentIntLevel = intervalLevels[currentInterval] ?? -1;

            const targetPlan = plan.title.toLowerCase();
            const targetLevel = planLevels[targetPlan];
            const targetIntLevel =
              intervalLevels[isAnnual ? "yearly" : "monthly"];

            const isSamePlan =
              currentLevel == targetLevel && currentIntLevel == targetIntLevel;

            const isUpgrade =
              currentPlan &&
              (targetIntLevel > currentIntLevel ||
                (targetLevel === currentLevel && targetLevel > currentLevel));

            const isDowngrade =
              currentPlan &&
              !isSamePlan &&
              (targetIntLevel < currentIntLevel ||
                (targetLevel < currentLevel &&
                  targetIntLevel === currentIntLevel));

            // console.log(isSamePlan, isUpgrade, isDowngrade, targetPlan, currentPlan);

            const formattedEnd = isValidPlan
              ? new Date(isValidPlan.endDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null;

            return (
              <div
                key={index}
                className={`relative shadow-[#3b3b3b] shadow-md flex flex-col items-center p-8 border rounded-md bg-bg ${
                  plan.title === "Pro"
                    ? "border-2 border-(--color-content)"
                    : "border-(--card-bg)"
                }`}
              >
                <span className="absolute top-0 px-6 pt-1 pb-2 font-medium rounded-b-lg bg-(--color-content) text-(--color-bg)">
                  {plan.title}
                </span>
                <p className="my-6 text-4xl font-bold text-content">
                  {plan.price}
                </p>
                <ul className="flex-1 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start space-x-2 text-left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-6 h-6 text-content mt-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (!isSamePlan && !isDowngrade)
                      handleBuy(plan.title.toLowerCase());
                  }}
                  disabled={
                    isSamePlan ||
                    isDowngrade ||
                    (plan.price === "$0" &&
                      currentPlan !== "free" &&
                      currentPlan)
                  }
                  className={`px-6 py-2 mt-6 font-semibold border rounded transition
                        ${
                          isSamePlan ||
                          isDowngrade ||
                          (plan.price === "$0" &&
                            currentPlan !== "free" &&
                            currentPlan)
                            ? "bg-(--card-bg) text-(--color-desc) border-(--card-bg) cursor-not-allowed"
                            : "text-content border-(--color-content) hover:bg-(--color-content) hover:text-(--color-bg)"
                        }`}
                >
                  {currentPlan && plan.price === "$0"
                    ? currentPlan === "free"
                      ? `Your Plan • ends ${formattedEnd}`
                      : "Downgrade Not Allowed"
                    : isSamePlan
                      ? `Your Plan • ends ${formattedEnd}`
                      : isUpgrade
                        ? "Upgrade Now"
                        : isDowngrade
                          ? "Downgrade Not Allowed"
                          : plan?.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;
