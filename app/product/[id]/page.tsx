import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductDetail } from "@/components/product-detail";
import { ProductReviews } from "@/components/product-reviews";
import { RelatedProducts } from "@/components/related-products";
import { ProductBreadcrumb } from "@/components/product-breadcrumb";
import { generateProductMetadata } from "@/lib/seo/metadata";
import {
  generateProductSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo/structured-data";
import { StructuredData } from "@/components/seo/structured-data";
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  await initModels();

  // Build query - support both ObjectId and slug
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query: any = isObjectId ? { _id: id } : { slug: id };
  query.status = "active";

  const product = await Product.findOne(query).lean();

  if (!product) {
    return {
      title: "Product Not Found | Eltooro",
    };
  }

  const price =
    typeof product.price === "object" ? product.price.ghs : product.price;
  const images = product.images?.map((img: { url: string }) => img.url) || [];
  const mainImage = images[0] || "/placeholder-product.jpg";

  return generateProductMetadata({
    name: product.name,
    description:
      product.description ||
      product.shortDescription ||
      `${product.name} - Organic beauty product from Eltooro. Fast delivery in Ghana.`,
    image: mainImage,
    slug: product.slug,
    price,
    currency: "GHS",
    brand: product.brand,
    category: product.category?.main,
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  await initModels();

  // Build query - support both ObjectId and slug
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query: any = isObjectId ? { _id: id } : { slug: id };
  query.status = "active";

  const product = await Product.findOne(query).lean();

  if (!product) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.eltooro.com";
  const price =
    typeof product.price === "object" ? product.price.ghs : product.price;
  const images = product.images?.map((img: { url: string }) => img.url) || [];
  const mainImage = images[0] || `${baseUrl}/placeholder-product.jpg`;
  const stock =
    typeof product.stock === "object"
      ? product.stock
      : { quantity: product.stock, inStock: product.stock > 0 };

  // Generate structured data
  const productSchema = generateProductSchema({
    name: product.name,
    description: product.description || product.shortDescription,
    image: images.length > 0 ? images : mainImage,
    sku: product.slug,
    brand: product.brand,
    price,
    currency: "GHS",
    availability: stock.inStock ? "in stock" : "out of stock",
    url: `${baseUrl}/product/${product.slug}`,
    rating: product.rating?.average,
    reviewCount: product.rating?.count,
    category: product.category?.main,
  });

  // Generate breadcrumb schema
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Products", url: `${baseUrl}/products` },
  ];

  if (product.category?.main) {
    breadcrumbItems.push({
      name: product.category.main,
      url: `${baseUrl}/products?category=${product.category.main}`,
    });
  }

  breadcrumbItems.push({
    name: product.name,
    url: `${baseUrl}/product/${product.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={[productSchema, breadcrumbSchema]} />
      <Header />
      <main className="container mx-auto px-4 py-4">
        <ProductBreadcrumb productId={id} />
        <ProductDetail productId={id} />
        <ProductReviews productId={id} />
        <RelatedProducts productId={id} />
      </main>
      <Footer />
    </div>
  );
}
