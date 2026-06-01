import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Contact Toroglo - Customer Support in Ghana",
  description:
    "Get in touch with Toroglo customer support. Contact us via phone, email, or live chat for order inquiries, shipping questions, product information, returns, and account help. Fast response times, available Monday-Sunday.",
  keywords: [
    "Toroglo contact",
    "Toroglo customer support",
    "contact Toroglo Ghana",
    "Toroglo phone number",
    "Toroglo email",
    "Toroglo support",
    "customer service Ghana",
    "organic beauty store support",
    "order help Ghana",
    "shipping questions Ghana",
  ],
  url: "https://www.toroglo.com/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
