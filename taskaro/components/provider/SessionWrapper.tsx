"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import AlarmProvider from "./AlarmProvider";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AlarmProvider>{children}</AlarmProvider>
    </SessionProvider>
  );
}
