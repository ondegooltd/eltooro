import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Products - Organic Beauty & Wellness Products | Eltooro Ghana",
  description:
    "Shop organic hair care, natural skin care, beard products, and wellness supplements in Ghana. Browse trending products, best sellers, new arrivals, and recommended items. Fast delivery to Accra, Kumasi, Cape Coast, and all of Ghana.",
  keywords: [
    "Eltooro products",
    "organic products Ghana",
    "natural hair products Ghana",
    "organic skincare Ghana",
    "beard products Ghana",
    "organic supplements Ghana",
    "beauty products Ghana",
    "wellness products Ghana",
    "natural products Accra",
    "organic cosmetics Ghana",
    "hair growth products Ghana",
    "skin care products Ghana",
  ],
  url: "https://www.eltooro.com/products",
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
