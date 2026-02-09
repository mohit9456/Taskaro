"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/authSlice";

export default function AuthBootstrap({ children }) {
  const { fetchUser, isAuthenticated } = useAuth();

  useEffect(() => {
    // agar redux empty hai but token exist karta hai
    if (!isAuthenticated) {
      fetchUser();
    }
  }, []);

  return children;
}
