import React from "react";

const HelpSupport = () => {
  return (
    <div className="my-20 w-[90%] md:w-[80%] mx-auto flex flex-col justify-center items-start gap-2">
      <h1 className="text-text font-bold text-[24px] md:text-[26px] poppins-font pb-3">
        Help & Support – Taskaro
      </h1>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        At Taskaro, we value your time and trust. That’s why we’re committed to
        making sure you receive the best possible support whenever you need it.
        Whether it's a technical issue, a question about your subscription, or
        simply learning how to use a feature — we're here to help.
      </p>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(20, 20, 20, 0.35) 0%, rgba(10, 10, 10, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          Support Options
        </p>
      </div>

      <p className="text-text text-[13px] md:text-[14px] poppins-font pb-2">
        You can reach us through multiple support channels:
      </p>
      <ul className="list-disc list-inside text-text text-[13px] md:text-[14px] poppins-font pb-2">
        <li>
          Email Support:{" "}
          <a
            href="mailto:support@taskaro.com"
            className="text-red-500 font-medium"
          >
            support@taskaro.com
          </a>
        </li>
        <li>Live Chat: Available inside the dashboard for instant help.</li>
        <li>
          FAQs & Documentation: Step-by-step help articles to guide you through
          features and common issues.
        </li>
      </ul>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(20, 20, 20, 0.35) 0%, rgba(10, 10, 10, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          When to Reach Us
        </p>
      </div>

      <p className="text-text text-[13px] md:text-[14px] poppins-font pb-2">
        Contact our support team if you are experiencing:
      </p>
      <ul className="list-disc list-inside text-text text-[13px] md:text-[14px] poppins-font pb-2">
        <li>Issues with login, account setup, or password reset</li>
        <li>Billing, subscription, or payment-related questions</li>
        <li>Technical bugs or system errors</li>
        <li>Suggestions or feedback about our product</li>
      </ul>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(20, 20, 20, 0.35) 0%, rgba(10, 10, 10, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          Our Commitment
        </p>
      </div>

      <p className="text-text text-[13px] md:text-[14px] poppins-font pb-2">
        Our goal is to respond to all support queries within 24 hours. For
        urgent matters, we prioritize responses to ensure your workflow doesn’t
        stop.
      </p>

      <p className="text-text text-[13px] md:text-[14px] poppins-font">
        You focus on managing tasks, we’ll handle everything else. For any
        concerns, feel free to email us directly at:{" "}
        <a
          href="mailto:support@taskaro.com"
          className="text-red-500 font-medium"
        >
          support@taskaro.com
        </a>
      </p>
    </div>
  );
};

export default HelpSupport;
