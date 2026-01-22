import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Auto-Delivery - Subscribe & Save | Eltooro Ghana",
  description:
    "Set up auto-delivery for your favorite organic products and save. Never run out of your essentials. Manage subscriptions, skip deliveries, or cancel anytime. Convenient, flexible, and cost-effective.",
  keywords: [
    "Eltooro auto-delivery",
    "subscribe and save",
    "auto-delivery Ghana",
    "product subscriptions",
    "recurring orders",
    "subscription service",
    "auto-reorder",
    "save on subscriptions",
  ],
  url: "https://www.eltooro.com/auto-delivery",
});

export default function AutoDeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
