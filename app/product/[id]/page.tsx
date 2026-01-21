import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetail } from "@/components/product-detail"
import { ProductReviews } from "@/components/product-reviews"
import { RelatedProducts } from "@/components/related-products"
import { ProductBreadcrumb } from "@/components/product-breadcrumb"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4">
        <ProductBreadcrumb productId={id} />
        <ProductDetail productId={id} />
        <ProductReviews productId={id} />
        <RelatedProducts productId={id} />
      </main>
      <Footer />
    </div>
  )
}
