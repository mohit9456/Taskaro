import React from "react";
import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "Contact Us & Support | Taskaro - Get in Touch",
  description:
    "Have questions about Taskaro? Reach out to our team for customer support, feature requests, bug reports, and enterprise inquiries. We respond within 4 hours.",
  openGraph: {
    title: "Contact Taskaro - Customer Support & Inquiries",
    description:
      "Get in touch with the Taskaro team for technical assistance, partnership opportunities, or product feedback.",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
