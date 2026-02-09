import React from "react";
import logoImg from "../public/Logo2.png";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const Company = [
    {
      id: 1,
      name: "About us",
      url: "/about-us",
    },
    {
      id: 2,
      name: "Features",
      url: "/features",
    },
    {
      id: 3,
      name: "Legal Disclaimer",
      url: "/legal-disclaimer",
    },
    {
      id: 4,
      name: "Privacy Policy",
      url: "/privacy-policy",
    },
    {
      id: 5,
      name: "Terms & Conditions",
      url: "/terms-conditions",
    },
    {
      id: 6,
      name: "Refund Policy",
      url: "/refund-policy",
    },
  ];

  const Explore = [
    { id: 1, name: "What is Taskaro?", url: "/what-is-taskaro" },
    { id: 2, name: "How Does Task Tracking Work?", url: "/features" },
    { id: 3, name: "What are Terms & Conditions?", url: "/terms-conditions" },
    { id: 4, name: "What's the Legal Disclaimer?", url: "/legal-disclaimer" },
    // { id: 5, name: "How Does the Refund Policy Work?", url: "/refund-policy" },
    { id: 6, name: "FAQs", url: "/faq" },
  ];

  const Resources = [
    {
      id: 1,
      name: "Blog",
      url: "/blog",
    },
    {
      id: 2,
      name: "Clients",
      url: "/clients",
    },
    {
      id: 3,
      name: "Refund & Cancellation",
      url: "/refund-cancellation",
    },
    {
      id: 4,
      name: "FAQs",
      url: "/faq",
    },
    {
      id: 5,
      name: "Help & Support",
      url: "/help-support",
    },
    {
      id: 6,
      name: "Contact us",
      url: "/contact-us",
    },
  ];

  const Community = [
    {
      id: 1,
      name: "Facebook",
      url: "https:www.facebook.com/",
    },
    {
      id: 2,
      name: "X (Twitter)",
      url: "https:www.x.com/",
    },
    {
      id: 3,
      name: "Instagram",
      url: "https:www.instagram.com/",
    },
    {
      id: 4,
      name: "Linkedin",
      url: "https:www.linkedin.com/",
    },
    {
      id: 5,
      name: "Youtube",
      url: "https:www.youtube.com/",
    },
  ];

  return (
    <footer className="pt-10 md:pt-20 pb-10 px-8 md:px-16 lg:px-28 bg-[#0b0b0b]">
      <div className="flex justify-center items-start flex-wrap mx-auto gap-y-8">
        <div className="flex flex-col w-full md:w-[25%] mx-auto space-y-4">
          <Image src={logoImg} alt="Taskaro logo" className="w-50 md:w-40 h-auto" />
          <div className="flex flex-col space-y-2 text-sm font-semibold uppercase text-[#f2f2f2]">
            <p>Plan Smarter || Work Faster</p>
          </div>
        </div>
        <div className="flex flex-col w-[45%] md:w-[16%] mx-auto space-y-4">
          <h2 className="font-bold text-base text-[#ffffff]">Company</h2>
          <div className="flex flex-col space-y-2 text-sm text-[#f2f2f2]">
            {Company.map((item, i) => (
              <Link key={i} href={item?.url}>
                {item?.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-[45%] md:w-[16%] mx-auto space-y-4">
          <h2 className="font-bold text-base text-[#ffffff]">Resources</h2>
          <div className="flex flex-col space-y-2 text-sm text-[#f2f2f2]">
            {Resources.map((item, i) => (
              <Link key={i} href={item?.url}>
                {item?.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-[45%] md:w-[25%] mx-auto space-y-4">
          <h2 className="font-bold text-base text-[#ffffff]">Explore</h2>
          <div className="flex flex-col space-y-2 text-sm text-[#f2f2f2]">
            {Explore.map((item, i) => (
              <Link key={i} rel="noopener noreferrer" href={item?.url}>
                {item?.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-[45%] md:w-[16%] mx-auto space-y-4">
          <h2 className="text-base font-bold text-[#ffffff]">Community</h2>
          <div className="flex flex-col space-y-2 text-sm text-[#f2f2f2]">
            {Community.map((item, i) => (
              <a key={i} rel="noopener noreferrer" href={item?.url}>
                {item?.name}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-12 text-center text-[14px]">
        <a href="mailto:business@taskaro.com" className="text-[#f2f2f2]">
          Contact Us 📧 business@taskaro.com
        </a>
      </div>
      <div className="w-full h-px bg-white my-2" />
      <div className="flex items-center justify-center px-6 text-center text-[8px] md:text-[12px]">
        <span className="text-[#f2f2f2]">
          © Copyright 2025 @taskaro.com. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
