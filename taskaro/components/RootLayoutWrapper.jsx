"use client";

import React from "react";
import StoreProvider from "@/components/provider/StoreProvider";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

const SessionWrapper = dynamic(
  () => import("@/components/provider/SessionWrapper"),
);

const RootLayoutWrapper = ({children}) => {
  return (
    <>
      <NextTopLoader />
      <SessionWrapper>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            // Define default options
            className: "",
            duration: 5000,
            removeDelay: 1000,
            style: {
              background: "#363636",
              color: "#fff",
            },

            // Default options for specific types
            success: {
              duration: 3000,
              iconTheme: {
                primary: "green",
                secondary: "black",
              },
            },
          }}
        />
        <StoreProvider>{children}</StoreProvider>
      </SessionWrapper>
    </>
  );
};

export default RootLayoutWrapper;
