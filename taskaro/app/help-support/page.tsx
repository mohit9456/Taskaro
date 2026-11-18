import { Metadata } from "next";
import HelpSupportContent from "./HelpSupportContent";

export const metadata: Metadata = {
  title: "Help & Support | Taskaro Knowledge Base",
  description:
    "Get assistance with Taskaro smart alarms, Razorpay billing, cross-department query SLAs, and account settings.",
  openGraph: {
    title: "Taskaro Help & Support Hub",
    description:
      "Troubleshooting guides, FAQs, and direct access to Taskaro engineering support.",
  },
};

export default function HelpSupportPage() {
  return <HelpSupportContent />;
}
