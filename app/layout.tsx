import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo/metadata";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/seo/structured-data";
import { StructuredData } from "@/components/seo/structured-data";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Eltooro - Organic Beauty & Wellness Products in Ghana",
    description:
      "Ghana's premier organic beauty and wellness store. Shop natural hair care, skin care, beard products, and organic supplements. Fast delivery across Accra, Winneba, Kumasi, and all of Ghana. Organic hair growth oil, natural skincare, beard care products.",
    keywords: [
      "Eltooro Ghana",
      "organic hair care Ghana",
      "natural skin care products Ghana",
      "beard growth oil Ghana",
      "organic supplements Ghana",
      "herbal beauty shop Accra",
      "natural hair products Ghana",
      "organic skincare Ghana",
    ],
  }),
  icons: {
    icon: [
      {
        url: "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
        type: "image/jpeg",
      },
      {
        url: "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
        type: "image/jpeg",
        sizes: "32x32",
      },
      {
        url: "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
        type: "image/jpeg",
        sizes: "16x16",
      },
    ],
    apple: [
      {
        url: "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
        type: "image/jpeg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en-GH">
      <head>
        <StructuredData data={[organizationSchema, websiteSchema]} />
      </head>
      <body className={`font-sans antialiased`}>
        <NextAuthSessionProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </NextAuthSessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
