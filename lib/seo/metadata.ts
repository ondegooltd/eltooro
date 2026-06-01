import { Metadata } from "next";
import { DEFAULT_SITE_URL, SITE_NAME } from "@/lib/site";
import { getMetaKeywords } from "./keywords";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;
const DEFAULT_DESCRIPTION =
  "Toroglo - Ghana's premier organic beauty and wellness store. Shop natural hair care, skin care, beard products, and organic supplements. Fast delivery across Accra, Winneba, Kumasi, and all of Ghana.";

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  noindex?: boolean;
  canonical?: string;
}

/**
 * Generate comprehensive SEO metadata
 */
export function generateMetadata(options: GenerateMetadataOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    image = `${SITE_URL}/og-image.jpg`,
    url,
    type = "website",
    noindex = false,
    canonical,
  } = options;

  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} - Organic Beauty & Wellness Products in Ghana`;

  const metaKeywords = keywords
    ? keywords.join(", ")
    : getMetaKeywords();

  const pageUrl = url || SITE_URL;
  const canonicalUrl = canonical || pageUrl;

  return {
    title: fullTitle,
    description,
    keywords: metaKeywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    openGraph: {
      type: type === "product" ? "website" : type, // OpenGraph doesn't support "product" type
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: pageUrl,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_GH",
      countryName: "Ghana",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@toroglo",
      site: "@toroglo",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    metadataBase: new URL(SITE_URL),
    verification: {
      // Add Google Search Console verification when available
      // google: "your-verification-code",
    },
    other: {
      "geo.region": "GH",
      "geo.placename": "Ghana",
      "geo.position": "5.6037;-0.1870", // Accra coordinates
      "ICBM": "5.6037, -0.1870",
    },
  };
}

/**
 * Generate product-specific metadata
 */
export function generateProductMetadata(product: {
  name: string;
  description?: string;
  image?: string;
  slug: string;
  price?: number;
  currency?: string;
  brand?: string;
  category?: string;
}): Metadata {
  const url = `${SITE_URL}/product/${product.slug}`;
  const image = product.image || `${SITE_URL}/og-image.jpg`;
  const description =
    product.description ||
    `Buy ${product.name} from Toroglo. ${product.brand ? `${product.brand} ` : ""}Organic beauty products in Ghana. Fast delivery available.`;

  const keywords = [
    product.name,
    product.brand,
    product.category,
    "organic products Ghana",
    "buy online Ghana",
    "Toroglo",
  ].filter((k): k is string => Boolean(k));

  return generateMetadata({
    title: product.name,
    description,
    keywords,
    image,
    url,
    type: "product",
    canonical: url,
  });
}

/**
 * Generate category-specific metadata
 */
export function generateCategoryMetadata(category: {
  name: string;
  description?: string;
  slug: string;
}): Metadata {
  const url = `${SITE_URL}/products?category=${category.slug}`;
  const description =
    category.description ||
    `Shop ${category.name} products at Toroglo. Organic, natural beauty and wellness products in Ghana. Fast delivery available.`;

  const keywords = [
    category.name,
    `${category.name} Ghana`,
    `organic ${category.name}`,
    `buy ${category.name} online`,
    "Toroglo",
  ];

  return generateMetadata({
    title: category.name,
    description,
    keywords,
    url,
    canonical: url,
  });
}
