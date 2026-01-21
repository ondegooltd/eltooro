import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutSuccess } from "@/components/checkout-success"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <CheckoutSuccess />
      </main>
      <Footer />
    </div>
  )
}
