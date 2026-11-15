import React from "react";

const LegalDisclaimer = () => {
  return (
    <div className="my-20 w-[90%] md:w-[80%] mx-auto flex flex-col justify-center items-start gap-2">
      <h1 className="text-text font-bold text-[24px] md:text-[26px] poppins-font pb-3">
        Legal Disclaimer for Taskaro
      </h1>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Taskaro is a collaborative task management platform designed to help
        teams and individuals organize, assign, and track their work
        efficiently.
      </p>
      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(60, 60, 60, 0.35) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          No Guarantee of Outcome
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Taskaro does not guarantee that using the app will result in improved
        team productivity or individual success. The effectiveness of task
        management varies based on user input and commitment.
      </p>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(60, 60, 60, 0.35) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          Limitation of Liability
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Taskaro and its developers are not liable for any data loss, task
        errors, or missed deadlines resulting from the use or misuse of the
        platform. Users are responsible for backing up their information and
        ensuring task accuracy.
      </p>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(60, 60, 60, 0.35) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          User Responsibility
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        All content, tasks, deadlines, and communication shared within the
        Taskaro platform are the sole responsibility of the users. Taskaro is
        not responsible for the accuracy or validity of the data entered by
        users.
      </p>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(60, 60, 60, 0.35) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          Third-Party Integration
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Taskaro may integrate with third-party tools for calendar, storage, or
        communication features. We do not control or guarantee the performance
        or policies of these external services.
      </p>

      <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-content) rounded-[9px]">
        <div
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(60, 60, 60, 0.35) 0%, rgba(0, 0, 0, 0) 100%)",
          }}
          className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
        ></div>
        <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
          Contact
        </p>
      </div>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font">
        For any legal concerns or clarifications regarding this disclaimer,
        please contact us at{" "}
        <a
          href="mailto:support@taskaro.in"
          className="text-red-400 font-medium no-underline"
        >
          support@taskaro.in
        </a>
        .
      </p>
    </div>
  );
};

export default LegalDisclaimer;
