declare module "*.css";
declare module "*.scss";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.svg";
declare module "*.gif";
declare module "*.webp";
declare module "*.mp4";
declare module "*.wav";

declare module "swiper/css";
declare module "swiper/css/*";
declare module "swiper/react" {
  export const Swiper: any;
  export const SwiperSlide: any;
}
declare module "swiper/modules" {
  export const Autoplay: any;
  export const Pagination: any;
  export const Navigation: any;
}
declare module "react-fast-marquee" {
  import React from "react";
  const Marquee: React.ComponentType<any>;
  export default Marquee;
}
declare module "shortid";

declare global {
  interface Window {
    Razorpay?: any;
  }
}
