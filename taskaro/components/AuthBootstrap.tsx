"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/lib/redux/features/authSlice";

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser();
    }
  }, []);

  return <>{children}</>;
}

