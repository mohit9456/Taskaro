"use client";

import React, { useEffect, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Api } from "@/lib/api";

const ResetClient = () => {
  const [formData, setFormaData] = useState({ password: "", cPassword: "" });
  const [errMsg, setErrorMsg] = useState("");
  const [loader, setLoader] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cvisible, setcVisible] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      router.push("/auth/forgot-password");
    }
  }, []);

  const handleChange = (e) => {
    setErrorMsg("");
    setFormaData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoader(true);

    Api.post("/auth/reset-password", {
      password: formData.password,
      cPassword: formData.cPassword,
      token: token,
    })
      .then((data) => {
        toast.success(data?.message);
        router.push("/auth/login");
      })
      .catch((error) => {
        setErrorMsg(
          error?.response.data.error ||
            "An unexpected error occurred. Please try again."
        );
        // console.error("Error fetching teams:", error?.response.data.error)
      })
      .finally(() => {
        setLoader(false);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-[95%] sm:w-[45%] max-w-lg mx-auto">
      <div className="flex flex-col justify-center items-center p-5 bg-(--card-bg) gap-7 shadow-lg rounded-lg">
        <h1 className="text-base text-center">
          {" "}
          <span className="text-3xl underline">Reset password</span> <br />{" "}
          <br /> create a strong password with at least 8 Alphanumeric
          characters (e.g., @,#,$)
        </h1>
        <div className="flex flex-col w-[80%] justify-center items-center gap-5">
          <div className="relative w-full">
            <input
              name="password"
              onChange={handleChange}
              className="p-2 w-full rounded-2xl text-sm md:text-base text-desc border-(--color-content) border outline-none"
              type={visible ? "text" : "password"}
              placeholder="Create Password"
            />
            {!visible ? (
              <IoMdEyeOff
                onClick={() => setVisible(true)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-desc"
              />
            ) : (
              <FaEye
                onClick={() => setVisible(false)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-desc"
              />
            )}
          </div>
          <div className="relative w-full">
            <input
              name="cPassword"
              onChange={handleChange}
              className="p-2 w-full rounded-2xl text-sm md:text-base text-desc border-(--color-content) border outline-none"
              type={cvisible ? "text" : "password"}
              placeholder="Confirm Password"
            />
            {!cvisible ? (
              <IoMdEyeOff
                onClick={() => setcVisible(true)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-desc"
              />
            ) : (
              <FaEye
                onClick={() => setcVisible(false)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-desc"
              />
            )}
          </div>
          {errMsg && (
            <p className="text-red-600 text-left w-full my-0 py-0 text-xs">
              * {errMsg}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loader && true}
            className="text-base font-semibold text-text mb-5 py-1 rounded-md bg-(--color-desc) text-(--color-bg) w-full max-w-61 flex justify-center items-center"
          >
            {loader ? (
              <FiLoader className="btn-loader" size={24} />
            ) : (
              "Reset Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetClient;
