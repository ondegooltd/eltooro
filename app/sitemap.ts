import { MetadataRoute } from "next";
import { initModels } from "@/lib/models/helpers";
import { Product, Category } from "@/lib/models";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await initModels();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${SITE_URL}/products`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/help`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${SITE_URL}/shipping`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/returns`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.5,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.5,
      },
    ];

    // Dynamic product pages
    const products = await Product.find({ status: "active" })
      .select("slug updatedAt")
      .lean()
      .limit(10000); // Limit to prevent timeout

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${SITE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Category pages
    const categories = await Category.find({ isActive: true })
      .select("slug updatedAt")
      .lean();

    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/products?category=${category.slug}`,
      lastModified: category.updatedAt || new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...productPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return at least static pages on error
    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
    ];
  }
}
