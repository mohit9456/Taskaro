"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { useAlarmSystem } from "../useAlarmSystem";

export default function SessionWrapper({ children }) {
  // ✅ बस hook call करो (yeh hi kaafi hai)
  useAlarmSystem();

  // 🔓 audio unlock (IMPORTANT)
  useEffect(() => {
    const unlock = () => {
      const a = new Audio("/alarm.wav");
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          console.log("🔓 Audio unlocked");
        })
        .catch(() => {});

      document.removeEventListener("click", unlock);
    };

    document.addEventListener("click", unlock);
  }, []);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}