"use client";
import { store } from "@/lib/redux/store";
import { requestFcmToken } from "@/lib/requestFcmToken";
import { useEffect } from "react";
import { Provider } from "react-redux";
// import NotificationProvider from "./NotificationContext";

export default function StoreProvider({ children }) {

  useEffect(() => {
    requestFcmToken();
  }, []);
  return (
    <Provider store={store}>
      {/* <NotificationProvider> */}
        {children}
        {/* </NotificationProvider> */}
    </Provider>
  );
}
