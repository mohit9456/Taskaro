import React from "react";

const TermsConditions = () => {
  return (
    <div className="my-20 w-[90%] md:w-[80%] mx-auto flex flex-col justify-center items-start gap-2">
      <h1 className="text-text font-bold text-[24px] md:text-[26px] poppins-font pb-3">
        Terms of Use for Taskaro
      </h1>
      <p className="text-text font-normal text-[13px] md:text-[14px] poppins-font pb-2">
        Welcome to Taskaro. These Terms of Use govern your access to and use of
        our task management platform, tools, and services.
      </p>

      {/* Agreement Section */}
      <SectionHeader title="Agreement" />
      <p className="section-text">
        By using Taskaro, you agree to our Terms of Use and Privacy Policy. If
        you do not agree, please do not use the platform.
      </p>

      {/* Eligibility */}
      <SectionHeader title="Eligibility" />
      <p className="section-text">
        You must be at least 13 years old to use Taskaro. By using the platform,
        you affirm that you meet this age requirement and are legally able to
        enter into this agreement.
      </p>

      {/* Code of Conduct */}
      <SectionHeader title="Code of Conduct" />
      <p className="section-subtitle">Users agree to:</p>
      <ul className="section-list">
        <li>- Use Taskaro ethically and respectfully.</li>
        <li>- Not post harmful, unlawful, or offensive content.</li>
        <li>- Not interfere with or disrupt Taskaro services.</li>
        <li>- Not misuse personal information of others on the platform.</li>
      </ul>

      {/* Account Responsibility */}
      <SectionHeader title="Account Registration and Responsibility" />
      <p className="section-text">
        You are responsible for maintaining the confidentiality of your login
        credentials. You must provide accurate, complete information when
        creating your account.
      </p>

      {/* Task and Project Data */}
      <SectionHeader title="Tasks and Project Data" />
      <p className="section-text">
        Content you upload (tasks, notes, project details, etc.) remains your
        responsibility. Do not upload sensitive, illegal, or proprietary content
        without rights.
      </p>

      {/* Subscription & Billing */}
      <SectionHeader title="Subscriptions & Billing" />
      <p className="section-text">
        Some Taskaro features may require a paid subscription. By subscribing,
        you authorize us to charge your chosen payment method in accordance with
        our pricing terms.
      </p>

      {/* Intellectual Property */}
      <SectionHeader title="Intellectual Property" />
      <p className="section-text">
        All trademarks, service marks, logos, content, and intellectual property
        on Taskaro belong to Taskaro or its licensors. Unauthorized use is
        prohibited.
      </p>

      {/* Limitation of Liability */}
      <SectionHeader title="Limitation of Liability" />
      <p className="section-text">
        Taskaro is not liable for any damages resulting from use of the
        platform. You agree to use the service at your own risk.
      </p>

      {/* Modifications */}
      <SectionHeader title="Modifications to Terms" />
      <p className="section-text">
        Taskaro reserves the right to modify these terms. We will notify users
        of significant changes. Continued use after updates means you accept the
        new terms.
      </p>

      {/* Contact */}
      <SectionHeader title="Contact Us" />
      <p className="section-text">
        If you have any questions, contact us at:
        <a
          href="mailto:support@taskaro.com"
          className="text-red-400 font-medium"
        >
          {" "}
          support@taskaro.com{" "}
        </a>
      </p>
    </div>
  );
};

const SectionHeader = ({ title }) => (
  <div className="w-full isolate overflow-hidden relative border-l-[4.82px] bg-(--card-bg) px-6 py-4 my-4 border-solid border-(--color-desc) rounded-[9px]">
    <div
      style={{
        background:
          "radial-gradient(50% 50% at 50% 50%, rgba(28, 28, 28, 0.35) 0%, rgba(20, 20, 20, 0) 100%)",
      }}
      className="absolute rounded-[50%] w-24 h-24 top-1/2 -translate-y-1/2 -left-10"
    ></div>
    <p className="text-text font-medium text-[14px] md:text-[15px] poppins-font">
      {title}
    </p>
  </div>
);

export default TermsConditions;
