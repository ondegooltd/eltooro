import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Truck, Plane, Clock, Globe, Package, CheckCircle } from "lucide-react"
import Link from "next/link"
import { generateMetadata } from "@/lib/seo/metadata"
import { Metadata } from "next"

export const metadata: Metadata = generateMetadata({
  title: "Shipping & Delivery - Eltooro Ghana",
  description:
    "Fast, reliable shipping to Ghana and worldwide. Free shipping on orders over $40. Standard, Express, and Priority shipping options. Track your order in real-time. Delivery to Accra, Kumasi, Cape Coast, Tamale, and all of Ghana.",
  keywords: [
    "Eltooro shipping",
    "Eltooro delivery Ghana",
    "free shipping Ghana",
    "organic products delivery Accra",
    "beauty products shipping Ghana",
    "international shipping Ghana",
    "track order Eltooro",
    "shipping methods Ghana",
    "delivery times Ghana",
    "express shipping Ghana",
  ],
  url: "https://www.eltooro.com/shipping",
})

const shippingMethods = [
  {
    icon: Truck,
    name: "Standard Shipping",
    time: "7-14 business days",
    price: "From $4.00",
    description: "Reliable ground shipping for non-urgent orders",
  },
  {
    icon: Plane,
    name: "Express Shipping",
    time: "3-5 business days",
    price: "From $10.00",
    description: "Faster delivery for time-sensitive orders",
  },
  {
    icon: Clock,
    name: "Priority Shipping",
    time: "1-3 business days",
    price: "From $20.00",
    description: "Our fastest option for urgent needs",
  },
]

const shippingFeatures = [
  "Climate-controlled fulfillment centers",
  "Real-time order tracking",
  "Signature confirmation available",
  "International customs support",
  "Insurance included on all orders",
  "Multiple carrier options",
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Truck className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping & Delivery</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Fast, reliable shipping to over 180 countries worldwide
            </p>
          </div>
        </section>

        {/* Free Shipping Banner */}
        <section className="bg-iherb-green-dark text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="font-semibold">FREE SHIPPING on orders over $40! Use code: FREESHIP</p>
          </div>
        </section>

        {/* Shipping Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shipping Options</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {shippingMethods.map((method) => (
                <div key={method.name} className="border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <method.icon className="h-8 w-8 text-iherb-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.name}</h3>
                  <p className="text-iherb-green font-bold mb-1">{method.time}</p>
                  <p className="text-muted-foreground mb-3">{method.price}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              * Shipping times and costs vary by destination. Final rates calculated at checkout.
            </p>
          </div>
        </section>

        {/* International Shipping */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-8 w-8 text-iherb-green" />
                  <h2 className="text-3xl font-bold">International Shipping</h2>
                </div>
                <p className="text-muted-foreground mb-6">
                  We ship to over 180 countries from our strategically located fulfillment centers in the USA, South
                  Korea, and Hong Kong, ensuring your products arrive fresh and on time.
                </p>
                <ul className="space-y-3">
                  {shippingFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-iherb-green shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-4">Estimated Delivery Times by Region</h3>
                <div className="space-y-3">
                  {[
                    { region: "United States", time: "3-7 days" },
                    { region: "Canada", time: "5-10 days" },
                    { region: "Europe", time: "7-14 days" },
                    { region: "Asia Pacific", time: "5-12 days" },
                    { region: "Middle East", time: "10-18 days" },
                    { region: "Africa", time: "14-21 days" },
                  ].map((item) => (
                    <div key={item.region} className="flex justify-between py-2 border-b last:border-0">
                      <span>{item.region}</span>
                      <span className="font-medium">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tracking CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <Package className="h-12 w-12 text-iherb-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Track Your Shipment</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Already placed an order? Track your package in real-time with our order tracking system.
            </p>
            <Link href="/track-order">
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">Track Order</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
