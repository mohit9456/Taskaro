"use client";

import React, { useEffect } from "react";
import { store } from "@/lib/redux/store";
import { requestFcmToken } from "@/lib/requestFcmToken";
import { Provider } from "react-redux";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    requestFcmToken();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}

