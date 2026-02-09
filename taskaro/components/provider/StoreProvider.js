"use client";
import { store } from "@/lib/redux/store";
import { Provider } from "react-redux";
// import NotificationProvider from "./NotificationContext";

export default function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      {/* <NotificationProvider> */}
        {children}
        {/* </NotificationProvider> */}
    </Provider>
  );
}
