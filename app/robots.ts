import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/orders/",
          "/wishlist/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-otp",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/orders/",
          "/wishlist/",
        ],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/orders/",
          "/wishlist/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
