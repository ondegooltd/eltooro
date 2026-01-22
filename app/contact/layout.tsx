import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Contact Eltooro - Customer Support in Ghana",
  description:
    "Get in touch with Eltooro customer support. Contact us via phone, email, or live chat for order inquiries, shipping questions, product information, returns, and account help. Fast response times, available Monday-Sunday.",
  keywords: [
    "Eltooro contact",
    "Eltooro customer support",
    "contact Eltooro Ghana",
    "Eltooro phone number",
    "Eltooro email",
    "Eltooro support",
    "customer service Ghana",
    "organic beauty store support",
    "order help Ghana",
    "shipping questions Ghana",
  ],
  url: "https://www.eltooro.com/contact",
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
