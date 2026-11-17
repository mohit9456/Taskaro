import React from "react";
import type { Metadata } from "next";
import ClientsContent from "./ClientsContent";

export const metadata: Metadata = {
  title: "Client Stories & Testimonials | Taskaro - Trusted by 10,000+ Users",
  description:
    "Read real reviews and stories from founders, engineers, and creators who transformed their daily focus, habits, and wake-up routines with Taskaro.",
  openGraph: {
    title: "Taskaro Reviews - Real Stories from High Performers",
    description:
      "Join thousands of professionals who have accelerated their execution velocity with Taskaro. 4.9/5 rating across 1,200+ reviews.",
  },
};

export default function ClientsPage() {
  return <ClientsContent />;
}
