import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Help Center - Toroglo Customer Support",
  description:
    "Toroglo Help Center. Find answers to frequently asked questions about orders, payments, shipping, returns, products, and account management. Browse help topics or contact our support team for assistance.",
  keywords: [
    "Toroglo help",
    "Toroglo FAQ",
    "customer support Ghana",
    "help center Toroglo",
    "frequently asked questions",
    "order help Ghana",
    "shipping help",
    "return help",
    "product questions",
    "account help Toroglo",
  ],
  url: "https://www.toroglo.com/help",
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
