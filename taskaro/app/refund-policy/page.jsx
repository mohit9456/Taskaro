import React from "react";

const RefundPolicy = () => {
  return (
    <div className="my-20 w-[90%] md:w-[80%] mx-auto flex flex-col justify-center items-start gap-2">
      {" "}
      <h1 className="text-text font-bold text-[24px] md:text-[26px] poppins-font pb-3">
        Refund Policy for Taskaro{" "}
      </h1>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        At Taskaro, we are committed to providing seamless task and project
        management services to all our users. However, we understand there may
        be circumstances that require a refund.
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
          Eligibility for Refund
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Users are eligible for a refund under the following conditions:
      </p>
      <ul className="list-disc list-inside text-text text-[13px] md:text-[14px] poppins-font pb-2">
        <li>Billing errors or accidental multiple charges.</li>
        <li>
          Cancellation of a subscription within 7 days of initial payment.
        </li>
        <li>
          Service failure or critical technical issues that prevent usage
          despite support assistance.
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
          Non-Refundable Situations
        </p>
      </div>
      <p className="text-text text-[13px] md:text-[14px] poppins-font pb-2">
        Refunds will not be issued under the following circumstances:
      </p>
      <ul className="list-disc list-inside text-text text-[13px] md:text-[14px] poppins-font pb-2">
        <li>Change of mind after purchasing a subscription.</li>
        <li>
          Lack of feature knowledge or unawareness of service limitations.
        </li>
        <li>
          Failure to cancel an active subscription before the renewal date.
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
          Refund Process
        </p>
      </div>
      <p className="text-text text-[13px] md:text-[14px] poppins-font">
        If you have any questions about this policy or your data, please contact
        us at:{" "}
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

export default RefundPolicy;
