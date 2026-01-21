import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutSuccess } from "@/components/checkout-success"
import { Loader2 } from "lucide-react"

function CheckoutSuccessContent() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="container mx-auto px-4 py-12">
              <div className="max-w-2xl mx-auto text-center">
                <Loader2 className="h-8 w-8 animate-spin text-iherb-green mx-auto mb-4" />
                <p className="text-muted-foreground">Loading order details...</p>
              </div>
            </div>
          }
        >
          <CheckoutSuccess />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return <CheckoutSuccessContent />
}
