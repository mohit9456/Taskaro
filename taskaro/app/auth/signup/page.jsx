"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FiLoader } from "react-icons/fi";
import { IoMdEyeOff } from "react-icons/io";
import { FaEye } from "react-icons/fa";
import { useAuth } from "@/lib/redux/features/authSlice";

const page = () => {
  const [formData, setFormaData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cPassword: "",
  });
  const [visible, setVisible] = useState(false);
  const [cvisible, setcVisible] = useState(false);

  const { loading, setGoogleLogin, setCreateUser, error } = useAuth();

  const handleChange = (e) => {
    if (e.target.name == "phone") {
      const phoneRegex = /^\d{0,10}$/;
      if (phoneRegex.test(e.target.value)) {
        setFormaData({ ...formData, [e.target.name]: e.target.value });
      }
    } else {
      setFormaData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = () => {
    setCreateUser(formData);
  };

  const handleGoogleAuth = () => {
    setGoogleLogin();
  };

  return (
    <div className="flex justify-center items-center my-20">
      <div className="flex flex-col justify-center items-center w-full max-w-md p-5 bg-(--card-bg) gap-4 shadow-lg rounded-lg">
        <h1 className="text-4xl md:text-2xl text-center pb-6">
          <span className="uppercase underline font-bold">
            Proffesional meets Discipline
          </span>
          <br />
          <span className="text-lg no-underline!">
            Create your profile and manage your Task !!{" "}
          </span>
        </h1>
        <div className="flex flex-col w-[95%] justify-center items-center gap-5">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
            type="name"
            placeholder="Enter full name"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
            type="text"
            placeholder="Enter phone"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
            type="email"
            placeholder="Enter email-ID"
          />
          <div className="relative w-full">
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
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
              value={formData.cPassword}
              onChange={handleChange}
              className="p-2 w-full rounded-full text-sm md:text-base text-desc border-(--color-content) border outline-none"
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
            {loading ? <FiLoader className="btn-loader" size={24} /> : "Signup"}
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

        <Link className="text-[#1E90FF] hover:underline" href={"/auth/login"}>
          Already have Account ?
        </Link>
      </div>
    </div>
  );
};

export default page;
