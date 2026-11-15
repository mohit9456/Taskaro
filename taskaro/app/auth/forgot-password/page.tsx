"use client";

import React, { useState } from "react";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { protectedApiPost } from "@/lib/api";
import { useRouter } from "next/navigation";

const page = () => {
  const [email, setEmail] = useState("");
  const [errMsg, setErrorMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [changeScreen, setChangeScreen] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    setErrorMsg("");
    setEmail(e.target.value);
  };

  const handleSubmit = async () => {
    setLoader(true);

    protectedApiPost("/auth/forgot-password", {
      email: email,
    })
      .then((data) => {
        toast.success(data?.message);
        setChangeScreen(true);
        // console.log("forgot password data", data)
      })
      .catch((error) => {
        setErrorMsg(
          error?.response.data.error ||
            "An unexpected error occurred. Please try again."
        );
        console.error("Error:", error);
      })
      .finally(() => {
        setLoader(false);
      });
  };

  return (
    <div className="flex justify-center items-center my-40">
      {!changeScreen ? (
        <div className="flex flex-col justify-center items-center w-full max-w-md p-5 bg-(--card-bg) gap-4 shadow-lg rounded-lg">
          <h1 className="text-4xl md:text-2xl text-center">
            <span className="uppercase underline font-bold">
              Forgot password
            </span>
            <br />
            <span className="text-sm no-underline!">
              No issue, Claim here And reset your password !!{" "}
            </span>
          </h1>
          <div className="flex flex-col w-[95%] justify-center items-center gap-5">
            <input
              name="email"
              onChange={handleChange}
              className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
              type="email"
              placeholder="Enter your userID/ email"
            />
            {errMsg && (
              <p className="text-red-600 text-left w-full -my-3 py-0 text-xs">
                * {errMsg}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={loader && true}
              className="text-base font-normal text-(--color-bg) py-1 rounded-2xl uppercase bg-(--color-desc) w-full max-w-61 flex justify-center items-center"
            >
              {loader ? (
                <FiLoader className="btn-loader" size={24} />
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center w-full max-w-4xl p-5 bg-(--card-bg) gap-2 shadow-lg rounded-lg">
          <h2 className="text-3xl header text-center text-text">
            Your Reset Link is on Its Way! ✈
          </h2>
          <p className="text-base text-center pt-10 text-text">
            We’ve sent a password reset link to your email. Please check your
            inbox and follow the instructions to set a new password. Don’t
            forget to check your spam folder if you don’t see it right away !
          </p>
          <p className="text-base text-center py-10 text-text">
            (For your security, the link will expire in 1 hour. If you didn’t
            request a password reset, please ignore this email)
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-8 text-base font-semibold text-text mb-5 py-1 rounded-md bg-(--color-desc) text-(--color-bg)"
          >
            Back to login page
          </button>
        </div>
      )}
    </div>
  );
};

export default page;
