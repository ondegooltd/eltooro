import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Returns & Refunds Policy - Eltooro Ghana",
  description:
    "Easy, hassle-free returns within 60 days of purchase. Free returns with prepaid shipping labels. Quick refunds processed within 4-7 business days. Learn about eligible items, return process, and refund policy at Eltooro.",
  keywords: [
    "Eltooro returns",
    "Eltooro refund policy",
    "return policy Ghana",
    "free returns Ghana",
    "organic products return",
    "beauty products refund",
    "return process Eltooro",
    "refund time Ghana",
    "return shipping Ghana",
    "return policy organic store",
  ],
  url: "https://www.eltooro.com/returns",
});

const returnSteps = [
  {
    step: 1,
    title: "Request Return",
    description: "Log in and submit a return request from your orders page",
  },
  {
    step: 2,
    title: "Pack Items",
    description: "Securely pack products in original packaging if possible",
  },
  {
    step: 3,
    title: "Ship Back",
    description: "Use the prepaid label or drop off at designated location",
  },
  {
    step: 4,
    title: "Get Refund",
    description: "Refund processed within 4-7 business days after receipt",
  },
];

const eligibleItems = [
  "Unopened supplements and vitamins",
  "Sealed beauty products",
  "Unused sports nutrition items",
  "Unopened grocery products",
  "Defective or damaged items",
  "Incorrect items received",
];

const nonEligibleItems = [
  "Opened or used products",
  "Products past expiration date",
  "Items without original packaging",
  "Perishable goods (after delivery)",
  "Gift cards",
  "Clearance items marked final sale",
];

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <RotateCcw className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Returns & Refunds
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Easy, hassle-free returns within 60 days of purchase
            </p>
          </div>
        </section>

        {/* Return Policy Summary */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Our Return Policy</h2>
              <p className="text-lg text-muted-foreground mb-8">
                We want you to be completely satisfied with your purchase. If
                you&apos;re not happy with your order, you can return eligible
                items within{" "}
                <span className="font-semibold text-foreground">60 days</span>{" "}
                of delivery for a full refund.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg">
                  <Clock className="h-8 w-8 text-iherb-green mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">60-Day Window</h3>
                  <p className="text-sm text-muted-foreground">
                    Return items within 60 days of delivery
                  </p>
                </div>
                <div className="p-6 border rounded-lg">
                  <Package className="h-8 w-8 text-iherb-green mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Free Returns</h3>
                  <p className="text-sm text-muted-foreground">
                    Prepaid shipping labels provided
                  </p>
                </div>
                <div className="p-6 border rounded-lg">
                  <CreditCard className="h-8 w-8 text-iherb-green mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">Quick Refunds</h3>
                  <p className="text-sm text-muted-foreground">
                    Processed within 4-7 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Return */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              How to Return an Item
            </h2>
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {returnSteps.map((item, index) => (
                <div key={item.step} className="relative text-center">
                  <div className="w-12 h-12 bg-iherb-green text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  {index < returnSteps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-border" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/account">
                <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                  Start a Return
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Eligible / Non-Eligible */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Eligible for Return</h3>
                </div>
                <ul className="space-y-3">
                  {eligibleItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h3 className="text-xl font-semibold">
                    Not Eligible for Return
                  </h3>
                </div>
                <ul className="space-y-3">
                  {nonEligibleItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Return FAQs</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    How long do refunds take?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Once we receive your return, refunds are processed within
                    4-7 business days. The refund will be credited to your
                    original payment method. Bank processing times may vary.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-2"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Can I exchange an item instead of returning it?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We currently don&apos;t offer direct exchanges. Please
                    return the item for a refund and place a new order for the
                    item you want.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-3"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    What if my item arrived damaged?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    If your item arrived damaged, please contact our customer
                    service team immediately with photos of the damage.
                    We&apos;ll arrange a replacement or full refund at no cost
                    to you.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="item-4"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Do I have to pay for return shipping?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    For most returns, we provide a prepaid shipping label. For
                    international returns, shipping costs may vary based on your
                    location. Check your return request for specific details.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Need Help with a Return?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our customer service team is here to help with any questions about
              returns or refunds.
            </p>
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
