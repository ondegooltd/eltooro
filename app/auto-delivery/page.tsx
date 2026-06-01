"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Package, Calendar, Percent, Edit, Trash2, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const subscriptions = [
  {
    id: 1,
    name: "Vitamin D3 5000 IU",
    brand: "NOW Foods",
    price: 12.99,
    frequency: "Every 30 days",
    nextDelivery: "January 15, 2026",
    image: "/vitamin-d3-bottle.jpg",
    status: "Active",
  },
  {
    id: 2,
    name: "Omega-3 Fish Oil 1000mg",
    brand: "Nordic Naturals",
    price: 24.99,
    frequency: "Every 60 days",
    nextDelivery: "February 5, 2026",
    image: "/fish-oil-bottle.jpg",
    status: "Active",
  },
]

const benefits = [
  { icon: Percent, title: "Extra 5% Off", description: "Save on every auto-delivery order" },
  { icon: Calendar, title: "Flexible Schedule", description: "Choose delivery frequency that works for you" },
  { icon: RefreshCw, title: "Never Run Out", description: "Products arrive before you need them" },
  { icon: Package, title: "Free Shipping", description: "On all auto-delivery orders over $20" },
]

export default function AutoDeliveryPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <RefreshCw className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Auto-Delivery</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Subscribe and save on your favorite products. Never run out again!
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="h-6 w-6 text-iherb-green" />
                  </div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current Subscriptions */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Subscriptions</h2>
              <Link href="/products">
                <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </div>

            {subscriptions.length > 0 ? (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="bg-card border rounded-lg p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative w-24 h-24 shrink-0">
                        <Image src={sub.image || "/placeholder.svg"} alt={sub.name} fill className="object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{sub.brand}</p>
                            <h3 className="font-semibold text-lg">{sub.name}</h3>
                            <Badge className="mt-2 bg-iherb-green">{sub.status}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-iherb-green">${sub.price}</p>
                            <p className="text-sm text-muted-foreground">per delivery</p>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-6 text-sm">
                            <div>
                              <p className="text-muted-foreground">Frequency</p>
                              <Select defaultValue={sub.frequency}>
                                <SelectTrigger className="w-40 h-8 mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Every 30 days">Every 30 days</SelectItem>
                                  <SelectItem value="Every 45 days">Every 45 days</SelectItem>
                                  <SelectItem value="Every 60 days">Every 60 days</SelectItem>
                                  <SelectItem value="Every 90 days">Every 90 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Next Delivery</p>
                              <p className="font-medium mt-1">{sub.nextDelivery}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Skip Next
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted rounded-lg">
                <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
                <p className="text-muted-foreground mb-6">Start saving with auto-delivery today!</p>
                <Link href="/products">
                  <Button className="bg-iherb-green hover:bg-iherb-green-dark">Browse Products</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">How Auto-Delivery Works</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: 1,
                  title: "Choose Your Products",
                  description: "Select auto-delivery on any eligible product page",
                },
                { step: 2, title: "Set Your Schedule", description: "Pick how often you want products delivered" },
                { step: 3, title: "Enjoy Savings", description: "Save 5% and get free shipping on every order" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-iherb-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Save?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Browse our products and look for the &quot;Subscribe &amp; Save&quot; option to start your auto-delivery.
            </p>
            <Link href="/products">
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">Shop Products</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
