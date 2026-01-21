import { Header } from "@/components/header"
import { HeroBanner } from "@/components/hero-banner"
import { TrendingProducts } from "@/components/trending-products"
import { CategoryTabs } from "@/components/category-tabs"
import { NewArrivals } from "@/components/new-arrivals"
import { RecommendedProducts } from "@/components/recommended-products"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
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
