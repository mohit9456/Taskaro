"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const faqs = [
  {
    id: 1,
    que: `What is Taskaro?`,
    ans: `Taskaro is a modern task management and tracking platform designed to help individuals, teams, and organizations plan, assign, and monitor tasks in real time with maximum efficiency.`,
  },
  {
    id: 2,
    que: `Is Taskaro free to use?`,
    ans: `Taskaro offers both free and premium plans. You can get started with the free version, which includes basic task creation and tracking features.`,
  },
  {
    id: 3,
    que: `Can I assign tasks to multiple users?`,
    ans: `Yes, Taskaro allows you to assign a single task to multiple users if required, and each assignee can track and update their own progress.`,
  },
  {
    id: 4,
    que: `Can I create multiple workspaces or projects?`,
    ans: `Absolutely. You can create multiple workspaces or projects within your Taskaro account to organize your tasks better.`,
  },
  {
    id: 5,
    que: `How do I reset my Taskaro password?`,
    ans: `Go to the login page and click on "Forgot Password." Follow the instructions sent to your registered email to reset it.`,
  },
  {
    id: 6,
    que: `How do I keep my Taskaro account secure?`,
    ans: `Use a strong password, enable two-factor authentication (2FA), and avoid sharing your login details with anyone.`,
  },
  {
    id: 7,
    que: `Can I use Taskaro without verifying my email?`,
    ans: `Email verification is required to activate core features and ensure account security. We recommend verifying your email right after signup.`,
  },
  {
    id: 8,
    que: `What information is needed to complete my profile?`,
    ans: `To complete your Taskaro profile, you’ll be asked to provide your full name, profile picture, and optionally, your role or organization.`,
  },
  {
    id: 9,
    que: `Is my data safe on Taskaro?`,
    ans: `Yes. Taskaro uses encrypted storage and industry-grade security practices to keep your data safe and private.`,
  },
  {
    id: 10,
    que: `Is there a limit to how many tasks I can create?`,
    ans: `There’s no task limit on premium plans. Free plan users have a soft cap on the number of active tasks per workspace.`,
  },
  {
    id: 11,
    que: `Can I change my email or user details later?`,
    ans: `Yes. You can go to Account Settings and update your details like name, email, and profile image anytime.`,
  },
  {
    id: 12,
    que: `Can I add team members to my workspace?`,
    ans: `Yes. You can invite team members by email and assign them roles like Admin, Manager, or Member.`,
  },
  {
    id: 13,
    que: `Is there any cost for removing a team member or changing roles?`,
    ans: `No. Adding, removing, or changing roles of team members is completely free and can be done from the workspace settings.`,
  },
  {
    id: 14,
    que: `What should I do if I notice unauthorized activity?`,
    ans: `Immediately log out from all sessions, reset your password, and contact our support team through the Help Center.`,
  },
  {
    id: 15,
    que: `Does Taskaro offer referral rewards?`,
    ans: `We’re working on a referral program that will reward users who invite others to join Taskaro.`,
  },
  {
    id: 16,
    que: `Do I need to pay tax on Taskaro services?`,
    ans: `If you’re using our paid plans, applicable taxes will be included in your invoice based on your country’s tax regulations.`,
  },
];

const FAQS = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="my-20 w-[95%] md:w-[80%] mx-auto flex flex-col justify-center items-center">
      <h1 className="text-text text-center font-bold pb-10 text-[24px] md:text-[28px] poppins-font">
        FREQUENTLY ASKED QUESTIONS
      </h1>
      {faqs.map((faq, index) => (
        <div key={faq.id} className="my-2 md:my-3 w-full">
          <div
            style={{
              boxShadow: "0px 0.61px 5.22px 0px #727272",
            }}
            className="w-full flex justify-between items-center px-4 py-3 bg-bg rounded-[13px] gap-2"
          >
            <h6 className="poppins-font text-text font-semibold text-sm md:text-base">
              {faq?.que}
            </h6>
            <motion.div
              onClick={() => toggleFAQ(index)}
              transition={{ duration: 0.4 }}
              animate={{ rotate: openIndex === index ? 45 : 0 }}
              className="poppins-font text-text font-semibold text-[32px] md:text-[32px] text-center flex justify-center items-center h-8 w-8 cursor-pointer"
            >
              +
            </motion.div>
          </div>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openIndex === index ? "auto" : 0,
              opacity: openIndex === index ? 1 : 0,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="w-full border-[0.1px] border-(--card-bg) px-4 py-6 rounded-md">
              <p className="text-text font-normal text-sm poppins-font w-full md:w-[80%]">
                {faq?.ans}
              </p>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
};

export default FAQS;
