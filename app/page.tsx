import { Header } from "@/components/header"
import { HeroBanner } from "@/components/hero-banner"
import { TrendingProducts } from "@/components/trending-products"
import { CategoryTabs } from "@/components/category-tabs"
import { NewArrivals } from "@/components/new-arrivals"
import { RecommendedProducts } from "@/components/recommended-products"
import { Footer } from "@/components/footer"
import { generateMetadata } from "@/lib/seo/metadata"
import { generateLocalBusinessSchema } from "@/lib/seo/structured-data"
import { StructuredData } from "@/components/seo/structured-data"

export const metadata = generateMetadata({
  title: "Toroglo - Organic Beauty & Wellness Products in Ghana",
  description:
    "Shop organic hair care, natural skin care, beard products, and wellness supplements in Ghana. Fast delivery to Accra, Winneba, Kumasi, Cape Coast, Tamale, and Takoradi. Hair growth oil, organic skincare, beard care, and more.",
  keywords: [
    "Toroglo Ghana",
    "organic hair care Ghana",
    "natural skin care products Ghana",
    "beard growth oil Ghana",
    "herbal beauty shop Accra",
    "herbal beauty shop Winneba",
    "organic supplements Ghana",
    "natural hair products Ghana",
    "organic skincare Ghana",
    "buy organic products online Ghana",
  ],
});

export default function Home() {
  const localBusinessSchema = generateLocalBusinessSchema({
    name: "Toroglo",
    address: {
      city: "Accra",
      region: "Greater Accra",
      country: "GH",
    },
    priceRange: "$$",
    openingHours: ["Mo-Su 09:00-18:00"],
  });

  return (
    <div className="min-h-screen bg-background">
      <StructuredData data={localBusinessSchema} />
      <Header />
      <main>
        <HeroBanner />
        <div className="container mx-auto px-4 py-6">
          <TrendingProducts />
          <CategoryTabs />
          <NewArrivals />
          <RecommendedProducts />
        </div>
      </main>
      <Footer />
    </div>
  )
}
