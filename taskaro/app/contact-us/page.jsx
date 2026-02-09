"use client";

import Loader from "@/components/Loader";
import { Api } from "@/lib/api";
import Link from "next/link";
import React, { useState } from "react";
import toast from "react-hot-toast";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const submitInquiry = async () => {
    if (!name || !email || !topic || !message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await Api.post("/contact", {
        name,
        email,
        topic,
        message,
      });

      toast.success("Inquiry submitted successfully!");

      // reset form
      setName("");
      setEmail("");
      setTopic("");
      setMessage("");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-14 mb-10 md:mb-20 w-[90%] md:w-[65%] mx-auto flex flex-col justify-center items-center">
      <h1 className="text-text text-center font-bold pb-2 text-[28px] md:text-[35px] roboto-serif-font">
        Contact Form
      </h1>
      <p className="text-text font-normal text-[14px] text-center mx-auto md:text-[16px] poppins-font w-full md:w-[65%]">
        Have any questions or concerns? Contact us by filling out the form
        below. Don’t forget to also check out our{" "}
        <Link href={"/faq"} className="text-desc font-medium underline underline-offset-4">
          FAQ{" "}
        </Link>{" "}
        page!
      </p>
      <div className="flex w-full flex-col justify-center my-10 items-start">
        <p className="poppins-font text-text pb-2 text-[15px] md:text-[17px] font-medium">
          Your Name
        </p>
        <input
          name={"name"}
          id={"name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          type={"text"}
          style={{
            boxShadow: "5px 5px 10px 0px #00000040",
          }}
          className="bg-cardBg rounded-[14px] px-4 py-3 md:py-5 w-full focus:outline-none text-content text-[14px] md:text-[16px]"
          placeholder="Enter your name..."
        />
        <p className="poppins-font text-text pt-8 md:pt-10 pb-2 text-[15px] md:text-[17px] font-medium">
          Your Email Address
        </p>
        <input
          name={"email"}
          id={"email"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type={"email"}
          style={{
            boxShadow: "5px 5px 10px 0px #00000040",
          }}
          className="bg-cardBg rounded-[14px] px-4 py-3 md:py-5 w-full focus:outline-none text-content text-[14px] md:text-[16px]"
          placeholder="Enter your email..."
        />
        <p className="poppins-font text-text pt-8 md:pt-10 pb-2 text-[15px] md:text-[17px] font-medium">
          Topic of Inquiry
        </p>
        <input
          name={"text"}
          id={"text"}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          type={"text"}
          style={{
            boxShadow: "5px 5px 10px 0px #00000040",
          }}
          className="bg-cardBg rounded-[14px] px-4 py-3 md:py-5 w-full focus:outline-none text-content text-[14px] md:text-[16px]"
          placeholder="Topic of Inquiry..."
        />
        <p className="poppins-font text-text pt-8 md:pt-10 pb-2 text-[15px] md:text-[17px] font-medium">
          Your Message
        </p>
        <textarea
          name={"text"}
          rows={10}
          id={"text"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          type={"text"}
          style={{
            boxShadow: "5px 5px 10px 0px #00000040",
          }}
          className="bg-cardBg rounded-[14px] px-4 py-3 md:py-5 w-full focus:outline-none text-content text-[14px] md:text-[16px]"
          placeholder="Enter your message..."
        />
        <button
          disabled={loading}
          onClick={submitInquiry}
          className="w-full max-w-60 mt-10 bg-(--color-content) mx-auto text-(--color-bg) text-sm md:text-base py-2 rounded-full shadow-md"
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            "Submit Inquiry"
          )}
        </button>
      </div>
    </div>
  );
};

export default Contact;
