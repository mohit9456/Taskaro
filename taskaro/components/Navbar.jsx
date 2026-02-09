"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import logo from "../public/Logo3.png";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FaArrowRight } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { CgProfile } from "react-icons/cg";

const headerData = [
  {
    id: 1,
    name: "Home",
    url: "/",
  },
  {
    id: 2,
    name: "Clients",
    url: "/clients",
  },
  {
    id: 3,
    name: "Features",
    url: "/features",
  },
  {
    id: 4,
    name: "Pricing",
    url: "/pricing",
  },
  {
    id: 5,
    name: "Contact",
    url: "/contact-us",
  },
];

const Navbar = () => {
  const [navbarClose, setNavbarClose] = useState(false);
  const [profileHover, setProfileHover] = useState(false);

  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  return (
    <header className="flex backdrop-blur sticky top-0 bg-(--card-bg) items-center py-4 md:py-2 justify-between px-4 md:px-10 z-999">
      <nav className="w-full">
        <div className="flex justify-between items-center mx-auto max-w-screen">
          <Link href="/" className="flex w-fit items-center">
            <Image
              src={logo}
              alt="taskaro Logo"
              className="w-40 md:w-52 dark:invert dark:brightness-0"
            />
          </Link>
          <div className="flex items-center lg:order-2">
            <div className="flex items-center justify-center relative">
              {session ? (
                <div
                  onMouseEnter={() => setProfileHover(true)}
                  onMouseLeave={() => setProfileHover(false)}
                >
                  <button className="bg-gray-800 hidden md:flex items-center gap-1 text-gray-50 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 text-center">
                    <CgProfile /> {session.user?.name}
                  </button>
                  <CgProfile
                    color="var(--color-content)"
                    size={24}
                    className="md:hidden mr-3"
                  />
                  {profileHover && (
                    <div className="absolute gap-4 top-full w-40 h-24 left-0 rounded-md flex flex-col items-start p-4 bg-gray-800 ">
                      <Link
                        href="/dashboard/update-profile"
                        className="text-gray-50 font-medium text-sm underline md:text-base"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-gray-50 font-medium text-sm underline md:text-base"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-gray-800 hidden md:block text-gray-50 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 text-center"
                >
                  Log in
                </Link>
              )}
              <Link
                href="/join"
                className="text-(--color-bg) bg-(--color-primary) hover:bg-primary-800 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 text-center focus:outline-none"
              >
                Join Now
              </Link>
            </div>
            <button
              onClick={() => setNavbarClose(true)}
              data-collapse-toggle="mobile-menu-2"
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="mobile-menu-2"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <svg
                className="hidden w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out transform ${
              navbarClose ? "translate-x-0" : "-translate-x-full"
            } lg:hidden fixed top-0 left-0 w-full h-screen bg-(--card-bg) flex flex-col px-5 pt-5 gap-5 z-50`}
          >
            <div className="text-sm md:text-base flex w-full justify-between items-center px-4 py-2">
              <Link href="/" className="flex w-fit items-center">
                <Image
                  src={logo}
                  alt="taskaro Logo"
                  className="w-40 md:w-52 dark:invert dark:brightness-0"
                />
              </Link>
              <ImCross
                onClick={() => setNavbarClose(false)}
                size={20}
                color="var(--color-content)"
              />
            </div>
            <div className="flex flex-col justify-start items-start gap-3 w-full">
              {headerData.map((item) => (
                <Link
                  key={item.id}
                  href={item.url}
                  className="text-sm md:text-base flex w-full justify-between items-center px-4 py-2 hover:text-gray-800"
                >
                  <p className="text-content text-base md:text-base font-medium">
                    {item.name}
                  </p>
                  <FaArrowRight color="var(--color-content)" />
                </Link>
              ))}
            </div>
            {session && (
              <div className="flex w-full justify-between items-center px-4 py-2">
                <Link
                  href="/auth/login"
                  className="bg-gray-800 dark:bg-gray-200 text-gray-50 dark:text-gray-950 font-semibold uppercase rounded-lg text-sm py-2 w-[49%] text-center"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gray-800 dark:bg-gray-200 text-gray-50 dark:text-gray-950 font-semibold uppercase rounded-lg text-sm py-2 w-[49%] text-center"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div
            className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              {headerData.map((item) => (
                <li key={item?.id}>
                  <Link
                    href={item?.url}
                    className="block py-2 pr-4 pl-3 text-text rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0"
                    aria-current="page"
                  >
                    {item?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
