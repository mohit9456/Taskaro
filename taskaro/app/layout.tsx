import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";
import { Poppins } from "next/font/google";
import RootLayoutWrapper from "@/components/RootLayoutWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Taskaro - Smart Task & Productivity Management",
  description: "Organize tasks, boost discipline with smart alarms, habit & lifestyle tracking with Taskaro.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="hydrated dark" suppressHydrationWarning>
      <body className={poppins.className}>
        <RootLayoutWrapper>
          <Navbar />
          {children}
          <Footer />
        </RootLayoutWrapper>
      </body>
    </html>
  );
}

