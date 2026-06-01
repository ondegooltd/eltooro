import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutContent } from "@/components/checkout-content"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header />
        <main className="flex-1">
          <CheckoutContent />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
