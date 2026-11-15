import React from "react";
import Marquee from "react-fast-marquee";
import HeroSection from "../components/home/HeroSection";
import TestimonialsSection from "../components/home/TestimonialsSection";
import Image from "next/image";
import easeToUseGif from "../../public/home/easeToUse.gif";
import assignWork from "../../public/home/assignWork.gif";
import socialIcons from "../../public/home/socialIcons.png";

const page = () => { 
  return ( 
    <div className="min-h-screen overflow-x-hidden">
      <HeroSection />

      <section className="mt-10 md:mt-20">
        <h2 className="text-xl font-bold text-center text-text md:text-4xl font-pj pb-10">
          Trusted by industry leaders
        </h2>
        <div className="marquee mb-4 overflow-hidden whitespace-nowrap">
          <Marquee speed={110}>
            {[
              "cosmos",
              "linktree",
              "the-knot",
              "todoist",
              "timely",
              "vectorly",
              "forma",
              "abstract",
              "bitly",
              "zillow",
              "asana",
              "linktree",
              "abstract",
              "forma",
            ].map((logo, i) => (
              <div key={i} className="mx-8 inline-block relative">
                <img
                  src={`https://www.logggos.club/logos/${logo}.svg`}
                  alt={logo}
                  className="h-6 w-auto rounded-md dark:invert"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </section>
      <section className="w-[95%] md:w-[85%] mx-auto flex flex-col justify-center items-cemter gap-4 py-10 md:py-20">
        <h2 className="text-xl font-bold text-text text-center md:text-4xl font-pj">
          Easy to Use
        </h2>
        <p className="text-content text-sm md:text-bas text-center">
          Taskaro is designed with simplicity in mind — whether you're assigning
          tasks, tracking progress, or collaborating with your team. No steep
          learning curves, just productivity from day one.
        </p>
        <Image
          src={easeToUseGif}
          alt="Easy To use"
          className="w-full h-auto rounded"
        />
      </section>

      <TestimonialsSection />

      <section className="flex flex-col md:flex-row justify-between items-start md:items-center w-[95%] md:w-[85%] mx-auto my-10 md:my-14">
        <div className="w-full md:w-[45%] p-4">
          <div className="relative">
            <Image
              src={assignWork}
              alt="Assign WOrk AI/ ML"
              className="w-[70vh] h-auto rounded-lg"
            />
          </div>
        </div>
        <div className="w-full md:w-[45%] p-4">
          <div className="content-wrapper">
            <h2 className="text-xl font-bold text-text md:text-4xl font-pj pb-4">
              Assign Work Instantly with Predictive AI
            </h2>
            <p className="text-sm md:text-base text-content">
              Taskaro leverages advanced AI/ML to take the guesswork out of task
              assignment. By analyzing past activity, user patterns, and team
              performance, it smartly recommends tasks tailored to each team
              member.
              <br />
              This intelligent feature ensures your projects stay on track,
              boosts team productivity, and optimizes workload distribution —
              all with minimal manual input.
              <br />
              With Taskaro’s predictive engine, you're not just assigning work —
              you're making informed, data-backed decisions that empower your
              team to perform at their best.
              <br />
              Unlock new levels of efficiency and scale your operations with
              confidence using Taskaro’s Predictive AI.
            </p>
          </div>
        </div>
      </section>
      <section className="flex flex-col md:flex-row-reverse justify-between items-start md:items-center w-[95%] md:w-[85%] mx-auto my-10 md:my-14">
        <div className="w-full md:w-[45%] p-4">
          <div className="relative">
            <Image
              src={socialIcons}
              alt="Social Icons"
              className="w-[70vh] h-auto rounded-lg"
            />
          </div>
        </div>
        <div className="w-full md:w-[45%] p-4">
          <div className="content-wrapper">
            <h2 className="text-xl font-bold text-text md:text-4xl font-pj pb-4">
              Effortless Integration with Taskaro
            </h2>
            <p className="text-sm md:text-base text-content">
              Taskaro seamlessly integrates with popular apps like Google
              Calendar and WhatsApp, enhancing workflow efficiency. Create,
              manage, and synchronize tasks with ease, allowing for a smooth
              work experience. By harnessing Taskaro's flexibility and
              compatibility, you can streamline your tasks and collaborate
              seamlessly across multiple platforms, keeping your work organized
              and efficient.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 flex flex-col md:flex-row items-center justify-between rounded-lg text-white py-16 w-[95%] md:w-[85%] mx-auto my-10 md:my-14 px-10">
        {/* Support Hours Section */}
        <div className="w-full md:w-[45%]">
          <h2 className="text-2xl font-bold mb-4">
            <img
              src="https://tasktracker.in/webassets/images/getintouch.webp"
              alt="Get in Touch"
              width={50}
              height={50}
              className="inline-block mr-2"
            />
            24x7 Support
          </h2>
          <p className="text-lg">
            ● Total assistance for onboarding and effective tool utilization
            <br />
            ● Need-based customization
            <br />● Cost-effective and efficient solution
          </p>
        </div>

        {/* Get in Touch Section */}
        <div className="w-full md:w-[45%]">
          <h2 className="text-2xl font-bold mb-4">
            <img
              src="https://tasktracker.in/webassets/images/support.webp"
              alt="Support"
              width={50}
              height={50}
              className="inline-block mr-2"
            />
            Get in Touch
          </h2>
          <p className="text-lg mb-4">
            For more details about the product and questions reach us at
          </p>
          <div className="supportSec">
            <a
              className="text-blue-400 hover:underline"
              href="mailto:support@taskaro.io"
            >
              support@taskaro.io
            </a>
            <br />
            or{" "}
            <a
              className="text-blue-400 hover:underline"
              href="tel:+919319185740"
            >
              +91 9319185740
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
