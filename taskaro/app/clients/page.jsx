"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import dynamic from "next/dynamic";

const Marquee = dynamic(() => import("react-fast-marquee"), {
  ssr: false,
});
import hero_img from "../../public/clients/clients.png";
import Image from "next/image";

export default function page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#242424] to-[#3a3a3a] text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between w-[95%] md:w-[85%] mx-auto gap-12 mb-24">
          <div className="lg:w-[60%]">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              What Our Clients Say About Our Task Management App
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of professionals who have transformed their
              productivity with our intuitive task management solution. Our
              users consistently report significant improvements in their
              workflow efficiency and team collaboration.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-full">
                <p className="font-medium">⭐ 4.9/5 Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-full">
                <p className="font-medium">🚀 98% Productivity Boost</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-full">
                <p className="font-medium">👥 10,000+ Happy Users</p>
              </div>
            </div>
          </div>
          <div className="lg:w-[45%]">
            <div className="relative w-full">
              <Image src={hero_img} alt="Professional Profile" />
            </div>
          </div>
        </section>

        {/* Client Logos Marquee */}
        <section className="mb-24">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Trusted by industry leaders
          </h2>
          <div className="mb-10 overflow-hidden whitespace-nowrap">
            <Marquee speed={90}>
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
          <div className="overflow-hidden whitespace-nowrap">
            <Marquee speed={90} direction="right">
              {[
                "zillow",
                "linktree",
                "the-knot",
                "asana",
                "linktree",
                "vectorly",
                "forma",
                "abstract",
                "bitly",
                "cosmos",
                "todoist",
                "timely",
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

        {/* Testimonials Swiper */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Real Stories from Our Users
          </h2>
          <div className="max-w-7xl mx-auto">
            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              slidesPerView={1}
              autoplay={true}
              spaceBetween={30}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                },
              }}
              className="mySwiper"
            >
              {testimonials.map((testimonial, index) => (
                <SwiperSlide key={index}>
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg h-full">
                    <div className="flex items-center mb-6 h-full">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          fill="true"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {testimonial.name}
                        </h3>
                        <p className="text-gray-300">{testimonial.position}</p>
                      </div>
                    </div>
                    <p className="text-lg mb-6">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white/5 backdrop-blur-md p-12 rounded-3xl text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Team&apos;s Productivity?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied users and experience the difference our
            task management app can make.
          </p>
          <button className="bg-white text-[#242424] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
            Get Started Now
          </button>
        </section>
      </div>
    </div>
  );
}

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Product Manager, Microsoft",
    quote:
      "This task management app has completely transformed how our team works. We've seen a 40% increase in productivity since implementation.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Michael Chen",
    position: "CTO, Startup Tech",
    quote:
      "As a fast-growing startup, we needed a solution that could scale with us. This app has been perfect - flexible and powerful.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "David Rodriguez",
    position: "Operations Director, Retail Chain",
    quote:
      "Implementing this across our 50+ locations was seamless. Customer satisfaction scores have improved by 15% since rollout.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Priya Sharma",
    position: "Marketing Director, Digital Agency",
    quote:
      "The collaboration features have reduced our email traffic by 60% while improving project visibility across teams.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
  },
  {
    name: "James Wilson",
    position: "Engineering Lead, FinTech",
    quote:
      "Our sprint planning has become more efficient and our velocity has increased by 25% thanks to the intuitive prioritization tools.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Emily Brown",
    position: "CEO, E-commerce Platform",
    quote:
      "The reporting dashboard gives me the exact insights I need at a glance. Decision-making has never been faster.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
  },
  {
    name: "Alice Smith",
    position: "UX Designer, Creative Agency",
    quote:
      "The user interface is so intuitive that our team was able to adapt quickly. It has streamlined our design process significantly.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
  },
  {
    name: "John Doe",
    position: "Sales Manager, Retail Company",
    quote:
      "Our sales team has seen a 30% increase in conversions since we started using this app. It's a game changer!",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=761&q=80",
  },
  {
    name: "Linda Green",
    position: "HR Director, Corporate Firm",
    quote:
      "The task management features have improved our hiring process and team collaboration. Highly recommend!",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Robert Brown",
    position: "Project Coordinator, Non-Profit",
    quote:
      "This app has helped us manage our projects more effectively, allowing us to focus on our mission.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Jessica Taylor",
    position: "Content Strategist, Media Company",
    quote:
      "The collaboration tools have made it easy for our team to work together, even remotely. It's a must-have!",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Daniel White",
    position: "IT Manager, Tech Firm",
    quote:
      "The integration with our existing tools was seamless. This app has become an essential part of our workflow.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  },
  {
    name: "Sophia Johnson",
    position: "Business Analyst, Consulting Firm",
    quote:
      "The analytics features provide valuable insights that help us make data-driven decisions. Highly effective!",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
  },
];
