/**
 * Structured Data (JSON-LD) for SEO and AI Search Engines
 * Implements Schema.org markup for better search engine understanding
 */

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
  };
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    contactType: string;
    email?: string;
    areaServed: string;
  };
  sameAs?: string[];
}

export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  offers?: {
    "@type": "Offer";
    price: string;
    priceCurrency: string;
    availability:
      | "https://schema.org/InStock"
      | "https://schema.org/OutOfStock";
    url?: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
  category?: string;
}

export interface BreadcrumbSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface FAQSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(
  options: Partial<OrganizationSchema> = {},
): OrganizationSchema {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://eltooro.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Eltooro",
    url: baseUrl,
    logo: "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
    description:
      "Ghana's premier organic beauty and wellness store. Shop natural hair care, skin care, beard products, and organic supplements.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Accra",
      addressRegion: "Greater Accra",
      addressCountry: "GH",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      areaServed: "GH",
    },
    sameAs: [
      // Add social media links when available
      // "https://www.facebook.com/eltooro",
      // "https://www.instagram.com/eltooro",
      // "https://www.twitter.com/eltooro",
    ],
    ...options,
  };
}

/**
 * Generate Product structured data
 */
export function generateProductSchema(product: {
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  brand?: string;
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock";
  url?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
}): ProductSchema {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";
  const images = product.image
    ? Array.isArray(product.image)
      ? product.image
      : [product.image]
    : undefined;

  const schema: ProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    sku: product.sku,
    category: product.category,
  };

  if (product.brand) {
    schema.brand = {
      "@type": "Brand",
      name: product.brand,
    };
  }

  if (product.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      price: product.price.toString(),
      priceCurrency: product.currency || "GHS",
      availability:
        product.availability === "in stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: product.url || `${baseUrl}/product/${product.sku}`,
    };
  }

  if (product.rating !== undefined && product.reviewCount !== undefined) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    };
  }

  return schema;
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
): FAQSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessSchema(
  options: {
    name?: string;
    address?: {
      street?: string;
      city?: string;
      region?: string;
      country?: string;
      postalCode?: string;
    };
    phone?: string;
    priceRange?: string;
    openingHours?: string[];
  } = {},
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}#organization`,
    name: options.name || "Eltooro",
    image:
      "https://res.cloudinary.com/duznylrc6/image/upload/v1770031906/eltooro_logo_white_on_green.png_jk3lrv.jpg",
    url: baseUrl,
    telephone: options.phone,
    priceRange: options.priceRange || "$$",
    address: options.address
      ? {
          "@type": "PostalAddress",
          streetAddress: options.address.street,
          addressLocality: options.address.city || "Accra",
          addressRegion: options.address.region || "Greater Accra",
          postalCode: options.address.postalCode,
          addressCountry: options.address.country || "GH",
        }
      : undefined,
    openingHoursSpecification: options.openingHours
      ? options.openingHours.map((hours) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "09:00",
          closes: "18:00",
        }))
      : undefined,
    areaServed: {
      "@type": "Country",
      name: "Ghana",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Organic Beauty Products",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "Hair Care",
        },
        {
          "@type": "OfferCatalog",
          name: "Skin Care",
        },
        {
          "@type": "OfferCatalog",
          name: "Beard Care",
        },
        {
          "@type": "OfferCatalog",
          name: "Supplements",
        },
      ],
    },
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Eltooro",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
