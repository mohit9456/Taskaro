"use client";

import React from "react";
import logoImg from "../public/Logo2.png";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide marketing footer on dashboard views
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const Company = [
    { id: 1, name: "About us", url: "/about-us" },
    { id: 2, name: "Features", url: "/features" },
    { id: 3, name: "Legal Disclaimer", url: "/legal-disclaimer" },
    { id: 4, name: "Privacy Policy", url: "/privacy-policy" },
    { id: 5, name: "Terms & Conditions", url: "/terms-conditions" },
    { id: 6, name: "Refund Policy", url: "/refund-policy" },
  ];

  const Explore = [
    { id: 1, name: "What is Taskaro?", url: "/features" },
    { id: 2, name: "How Does Task Tracking Work?", url: "/features" },
    { id: 3, name: "What are Terms & Conditions?", url: "/terms-conditions" },
    { id: 4, name: "What's the Legal Disclaimer?", url: "/legal-disclaimer" },
    { id: 5, name: "FAQs", url: "/faq" },
  ];

  const Resources = [
    { id: 1, name: "Blog", url: "/features" },
    { id: 2, name: "Clients", url: "/clients" },
    { id: 3, name: "Refund & Cancellation", url: "/refund-policy" },
    { id: 4, name: "FAQs", url: "/faq" },
    { id: 5, name: "Help & Support", url: "/help-support" },
    { id: 6, name: "Contact us", url: "/contact-us" },
  ];

  const Community = [
    { id: 1, name: "Facebook", url: "https://www.facebook.com/" },
    { id: 2, name: "X (Twitter)", url: "https://www.x.com/" },
    { id: 3, name: "Instagram", url: "https://www.instagram.com/" },
    { id: 4, name: "Linkedin", url: "https://www.linkedin.com/" },
    { id: 5, name: "Youtube", url: "https://www.youtube.com/" },
  ];

  return (
    <footer className="pt-12 md:pt-16 pb-8 px-6 md:px-16 lg:px-28 bg-(--card-bg) border-t border-(--color-border) text-(--color-text) transition-colors">
      <div className="flex justify-between items-start flex-wrap mx-auto gap-8">
        <div className="flex flex-col w-full md:w-[25%] space-y-3">
          <Image src={logoImg} alt="Taskaro logo" className="w-40 h-auto dark:invert" />
          <p className="text-sm font-semibold uppercase text-(--color-desc)">
            Plan Smarter • Work Faster
          </p>
          <p className="text-xs text-(--color-desc) leading-relaxed">
            All-in-one productivity suite for tasks, smart alarms, habit streaks & lifestyle discipline.
          </p>
        </div>

        <div className="flex flex-col space-y-3 min-w-[120px]">
          <h2 className="font-bold text-sm text-(--color-text) uppercase tracking-wider">Company</h2>
          <div className="flex flex-col space-y-2 text-sm text-(--color-content)">
            {Company.map((item) => (
              <Link key={item.id} href={item.url} className="hover:text-(--color-primary) transition-colors">
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3 min-w-[120px]">
          <h2 className="font-bold text-sm text-(--color-text) uppercase tracking-wider">Resources</h2>
          <div className="flex flex-col space-y-2 text-sm text-(--color-content)">
            {Resources.map((item) => (
              <Link key={item.id} href={item.url} className="hover:text-(--color-primary) transition-colors">
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3 min-w-[120px]">
          <h2 className="font-bold text-sm text-(--color-text) uppercase tracking-wider">Explore</h2>
          <div className="flex flex-col space-y-2 text-sm text-(--color-content)">
            {Explore.map((item) => (
              <Link key={item.id} href={item.url} className="hover:text-(--color-primary) transition-colors">
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3 min-w-[120px]">
          <h2 className="font-bold text-sm text-(--color-text) uppercase tracking-wider">Community</h2>
          <div className="flex flex-col space-y-2 text-sm text-(--color-content)">
            {Community.map((item) => (
              <a
                key={item.id}
                target="_blank"
                rel="noopener noreferrer"
                href={item.url}
                className="hover:text-(--color-primary) transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-10 text-center text-sm text-(--color-desc)">
        <a href="mailto:business@taskaro.com" className="hover:text-(--color-primary) transition-colors">
          Contact Us: business@taskaro.com
        </a>
      </div>

      <div className="w-full h-px bg-(--color-border) my-6" />

      <div className="flex items-center justify-center text-center text-xs text-(--color-desc)">
        <span>© Copyright {new Date().getFullYear()} Taskaro. All Rights Reserved.</span>
      </div>
    </footer>
  );
}

