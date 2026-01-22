import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Help Center - Eltooro Customer Support",
  description:
    "Eltooro Help Center. Find answers to frequently asked questions about orders, payments, shipping, returns, products, and account management. Browse help topics or contact our support team for assistance.",
  keywords: [
    "Eltooro help",
    "Eltooro FAQ",
    "customer support Ghana",
    "help center Eltooro",
    "frequently asked questions",
    "order help Ghana",
    "shipping help",
    "return help",
    "product questions",
    "account help Eltooro",
  ],
  url: "https://www.eltooro.com/help",
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
