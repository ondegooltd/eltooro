import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Clock,
  Globe,
  Package,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = generateMetadata({
  title: "Shipping & Delivery - Eltooro Ghana",
  description:
    "Eltooro shipping and delivery. Standard and Express options in Winneba and Accra. Free delivery on orders over GH₵1000. We ship to all 16 regions in Ghana and internationally.",
  keywords: [
    "Eltooro shipping",
    "Eltooro delivery Ghana",
    "free shipping Ghana",
    "delivery Winneba",
    "delivery Accra",
    "express delivery Ghana",
    "international shipping Eltooro",
  ],
  url: "https://www.eltooro.com/shipping",
});

const shippingRates = [
  {
    area: "Winneba",
    options: [
      {
        name: "Standard Shipping",
        time: "Within 5 hours to 12 hours (during working hours)",
        price: "GH₵16",
      },
      {
        name: "Express Shipping",
        time: "1 hour to 2 hours",
        price: "GH₵23",
      },
    ],
  },
  {
    area: "Accra",
    options: [
      {
        name: "Standard Shipping",
        time: "Within 3 hours to 12 hours (during working hours)",
        price: "GH₵40",
      },
      {
        name: "Express Shipping",
        time: "1 hour to 2 hours",
        price: "GH₵75",
      },
    ],
  },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Truck className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shipping & Delivery
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              At Eltooro, we are committed to getting your organic wellness
              essentials to your doorstep as quickly and safely as possible.
              Whether you are in the heart of Accra or across the globe,
              we&apos;ve got you covered.
            </p>
          </div>
        </section>

        {/* Shipping Methods (Rates) */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">
              Shipping Method
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {shippingRates.map(({ area, options }) => (
                <div
                  key={area}
                  className="border rounded-xl p-6 bg-card"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-iherb-green" />
                    {area}
                  </h3>
                  <ul className="space-y-4">
                    {options.map((opt) => (
                      <li
                        key={`${area}-${opt.name}`}
                        className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{opt.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {opt.time}
                          </p>
                        </div>
                        <span className="font-semibold text-iherb-green shrink-0">
                          {opt.price}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping & Delivery - Ghana */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              🇬🇭 Shipping Within Ghana
            </h2>
            <p className="text-muted-foreground mb-8 max-w-3xl">
              We proudly ship to all 16 regions in Ghana. Our logistics partners
              ensure that your products are handled with care.
            </p>
            <ul className="space-y-4 max-w-3xl mb-8">
              <li className="flex gap-3">
                <Truck className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Free Shipping:</strong> All orders totaling GH₵1,000
                  and above qualify for FREE delivery anywhere within Ghana.
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Standard Delivery</strong> (Accra, Cape Coast,
                  Takoradi & Kumasi): Delivered within 6 hours to 24 hours.
                </span>
              </li>
              <li className="flex gap-3">
                <Globe className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Regional Delivery</strong> (Volta, Sunyani, Bono
                  Region, Tamale, Wa, Bolgatanga): Delivered within 1–4 business
                  days via our regional courier partners.
                </span>
              </li>
            </ul>
            <h3 className="text-xl font-semibold mb-4">Local Shipping Options</h3>
            <ul className="space-y-2 text-muted-foreground max-w-3xl">
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">
                  Doorstep Delivery:
                </span>
                Direct to your home or office.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">
                  Station/Bus Pickup:
                </span>
                For customers in more remote areas who prefer picking up at a
                designated transport terminal.
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-foreground shrink-0">
                  In-Store Pickup:
                </span>
                (If applicable) Order online and pick up at our Accra location
                for free.
              </li>
            </ul>
          </div>
        </section>

        {/* International Shipping */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              🌍 International Shipping
            </h2>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              Eltooro is going global! We bring the best of Ghanaian organic
              beauty to your doorstep, no matter where you are.
            </p>
            <ul className="space-y-4 max-w-3xl">
              <li className="flex gap-3">
                <Clock className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Processing Time:</strong> We value your time. All
                  international shipments begin processing within 24 hours after
                  your order is confirmed.
                </span>
              </li>
              <li className="flex gap-3">
                <Truck className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Standard International Shipping:</strong> Estimated
                  Delivery Time: 31 days. This timeframe allows for international
                  logistics and customs clearance in your destination country.
                </span>
              </li>
              <li className="flex gap-3">
                <Package className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                <span>
                  <strong>Tracking:</strong> Once your order is dispatched, you
                  will receive a tracking number via email to monitor your
                  package&apos;s journey.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Order Tracking & Support */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Package className="h-8 w-8 text-iherb-green" />
              Order Tracking & Support
            </h2>
            <p className="text-muted-foreground mb-4 max-w-3xl">
              Once your order is placed, you will receive a confirmation
              message. Our team works hard to ensure your package is packed
              securely to prevent leaks or damage.
            </p>
            <p className="text-muted-foreground mb-4 max-w-3xl">
              <strong>Important Note:</strong> Please ensure your delivery
              address and contact number are accurate to avoid delays.
            </p>
            <p className="text-muted-foreground mb-6 max-w-3xl">
              For international orders, customers are responsible for any local
              customs duties or taxes that may apply upon arrival.
            </p>
            <p className="font-semibold mb-3">Have questions about your delivery? Contact our logistics team at:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-iherb-green shrink-0" />
                <a
                  href="https://wa.me/233537182367"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-iherb-green hover:underline"
                >
                  WhatsApp: +233-537-182-367
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-iherb-green shrink-0" />
                <a
                  href="mailto:eltooroltd@gmail.com"
                  className="text-iherb-green hover:underline break-all"
                >
                  Email: eltooroltd@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions (Shipping)
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="faq-1"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Can I change my delivery address after ordering?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    If your order hasn&apos;t been dispatched yet (usually
                    within 2 hours of ordering), we can update your address.
                    Please contact us immediately.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-2"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Do you deliver on weekends?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We deliver on Saturdays within Accra. Deliveries to other
                    regions and international shipments are processed on
                    business days (Monday – Friday).
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-3"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    What if I am not home when the courier arrives?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Our courier will call you. If you are unavailable, a second
                    delivery attempt may be made, or the package will be held
                    at a local hub for pickup.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Need Help with Your Delivery?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Contact our logistics team via WhatsApp or email for tracking or
              delivery questions.
            </p>
            <Link href="/contact">
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                Contact Support
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
