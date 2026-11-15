"use client";

import React from "react";
import StoreProvider from "@/components/provider/StoreProvider";
import { ThemeProvider } from "@/components/provider/ThemeProvider";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import NextTopLoader from "nextjs-toploader";

const SessionWrapper = dynamic(
  () => import("@/components/provider/SessionWrapper"),
);

interface RootLayoutWrapperProps {
  children: React.ReactNode;
}

export default function RootLayoutWrapper({ children }: RootLayoutWrapperProps) {
  return (
    <>
      <NextTopLoader color="var(--color-primary)" showSpinner={false} />
      <ThemeProvider>
        <SessionWrapper>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              className: "",
              duration: 5000,
              style: {
                background: "var(--card-bg)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
            }}
          />
          <StoreProvider>{children}</StoreProvider>
        </SessionWrapper>
      </ThemeProvider>
    </>
  );
}

