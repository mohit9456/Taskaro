"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FiLoader } from "react-icons/fi";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { useAuth } from "@/lib/redux/features/authSlice";
import { redirect } from "next/navigation";

const page = () => {
  const [formData, setFormaData] = useState({ email: "", password: "" });
  const [visible, setVisible] = useState(false);

  const { setLogin, loading, setGoogleLogin, isAuthenticated, error } =
    useAuth();

  const handleChange = (e) => {
    setFormaData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    setLogin(formData);
  };

  const handleGoogleAuth = () => {
    setGoogleLogin();
  };

  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="flex justify-center items-center my-20">
      <div className="flex flex-col justify-center items-center w-full max-w-md p-5 bg-(--card-bg) gap-4 shadow-lg rounded-lg">
        <h1 className="text-4xl md:text-2xl text-center pb-6">
          <span className="uppercase underline font-bold">Welcome Back</span>
          <br />
          <span className="text-lg no-underline!">
            Login and manage your Task !!
          </span>
        </h1>
        <div className="flex flex-col w-[95%] justify-center items-center gap-5">
          <input
            name="email"
            onChange={handleChange}
            className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
            type="email"
            placeholder="Enter userID/ Email"
          />
          <div className="relative w-full">
            <input
              name="password"
              onChange={handleChange}
              className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
              type={visible ? "text" : "password"}
              placeholder="Enter Password"
            />
            {!visible ? (
              <IoMdEyeOff
                onClick={() => setVisible(true)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-text"
              />
            ) : (
              <FaEye
                onClick={() => setVisible(false)}
                size={25}
                className="absolute cursor-pointer right-2 top-2 text-text"
              />
            )}
          </div>
          <Link
            href={"/auth/forgot-password"}
            className="my-0 -mt-3 py-0 text-[10px] font-normal w-fit ml-auto hover:underline"
          >
            forgot password?
          </Link>
          {error && (
            <p className="text-red-600 text-left w-full my-0 py-0 text-xs">
              * {error}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading && true}
            className="w-40 text-base font-semibold text-(--color-bg) py-1 rounded-2xl uppercase flex justify-center items-center bg-(--color-desc)"
          >
            {loading ? <FiLoader className="btn-loader" size={24} /> : "Login"}
          </button>
        </div>
        <p>OR</p>
        <p
          onClick={handleGoogleAuth}
          className="flex gap-2 justify-center items-center bg-bg rounded-full cursor-pointer border-(--color-bg) border-2 text-text px-4"
        >
          <img
            className="w-10 h-10"
            src={"https://pngimg.com/d/google_PNG19635.png"}
          />
          Continue with Google
        </p>
        <Link className="text-[#1E90FF] hover:underline" href={"/auth/signup"}>
          Don't have an Account ?
        </Link>
      </div>
    </div>
  );
};

export default page;
