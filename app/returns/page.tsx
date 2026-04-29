import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  XCircle,
  Package,
  Mail,
  Phone,
  AlertCircle,
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
  title: "Returns & Exchange Policy - Toroglo Ghana",
  description:
    "Toroglo return and exchange policy. No refunds; exchanges within 7 days for unopened items. Damaged or defective goods reported within 48 hours get a free replacement. Contact us via WhatsApp or email.",
  keywords: [
    "Toroglo returns",
    "Toroglo exchange policy",
    "no refund policy Ghana",
    "exchange policy Ghana",
    "damaged goods replacement",
    "organic products exchange",
    "Toroglo contact",
  ],
  url: "https://www.toroglo.com/returns",
});

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
              Return & Exchange Policy
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              At Toroglo, we take pride in the quality and organic integrity of
              our products. Due to the nature of our items (supplements, serums,
              and personal care), we maintain a strict hygiene and safety
              protocol.
            </p>
          </div>
        </section>

        {/* Policy Sections */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-12">
              {/* 1. No Refund Policy */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <XCircle className="h-7 w-7 text-red-600" />
                  1. No Refund Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Please note that all sales are final. We do not offer cash or
                  credit card refunds for goods purchased. Once a product has
                  been bought and delivered, it is not returnable.
                </p>
              </div>

              {/* 2. Exchange Policy */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <RotateCcw className="h-7 w-7 text-iherb-green" />
                  2. Exchange Policy
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  While we do not offer refunds, we are happy to facilitate an
                  exchange if you are not satisfied with your choice. To be
                  eligible for an exchange:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    The item must be unopened, unused, and in its original
                    packaging with the seal intact.
                  </li>
                  <li>
                    The exchange request must be made within 7 days of purchase.
                  </li>
                  <li>
                    Items can be exchanged for products of equal or higher value
                    (the customer will pay the price difference).
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Note:</strong> Shipping costs for exchanges are the
                  responsibility of the customer.
                </p>
              </div>

              {/* 3. Damaged or Defective Goods */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-7 w-7 text-amber-600" />
                  3. Damaged or Defective Goods
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We strive for perfection, but we understand that accidents can
                  happen during transit.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex gap-2">
                    <strong className="text-foreground shrink-0">
                      Report Window:
                    </strong>
                    <span>
                      For customers within Ghana, any damaged or defective goods
                      must be reported within 48 hours of delivery.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <strong className="text-foreground shrink-0">
                      Evidence:
                    </strong>
                    <span>
                      Please provide a photo or video of the damaged item along
                      with your order number.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <strong className="text-foreground shrink-0">
                      Resolution:
                    </strong>
                    <span>
                      Once verified, we will arrange for a free replacement of
                      the damaged item. Reports made after the 48-hour window
                      will unfortunately not be eligible for replacement.
                    </span>
                  </li>
                </ul>
              </div>

              {/* 4. How to Initiate */}
              <div className="border rounded-xl p-6 bg-muted/50">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Package className="h-7 w-7 text-iherb-green" />
                  4. How to Initiate an Exchange or Report Damage
                </h2>
                <p className="text-muted-foreground mb-4">
                  To start the process, please contact our support team via:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-iherb-green shrink-0" />
                    <a
                      href="https://wa.me/233537182367"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-iherb-green hover:underline"
                    >
                      WhatsApp/Phone: +233-537-182-367
                    </a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-iherb-green shrink-0" />
                    <a
                      href="mailto:info@toroglo.com"
                      className="text-iherb-green hover:underline break-all"
                    >
                      Email: info@toroglo.com
                    </a>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Information needed:</strong> Order Number, Product
                  Name, and Reason for Exchange/Damage Report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="faq-1"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Can I return my facial serum if I&apos;ve already opened it
                    but don&apos;t like the scent?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    No. For hygiene and safety reasons, we cannot accept returns
                    or exchanges on any organic products that have been opened
                    or had their safety seal broken.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-2"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    I received my order but realized I bought the wrong hair
                    oil. Can I swap it?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes! As long as the bottle is unopened and the seal is
                    intact, you can exchange it within 7 days. You will just
                    need to cover the delivery fee for the swap.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-3"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    What happens if my Bathing Lotion leaks in the package
                    during delivery?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    We&apos;ve got you covered. Please take a photo of the leak
                    and contact us within 48 hours. We will send you a fresh
                    bottle at no extra cost to you.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-4"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Why do I only have 48 hours to report a damaged item?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    As a local business, we want to resolve issues as quickly as
                    possible while the delivery details are still fresh with our
                    couriers. This allows us to investigate and replace your
                    item promptly.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem
                  value="faq-5"
                  className="bg-card border rounded-lg px-6"
                >
                  <AccordionTrigger className="hover:no-underline">
                    Can I exchange a supplement for a skin care product?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes, you can exchange any unopened item for another product
                    in a different category, provided the price is the same or
                    you pay the difference.
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
              Need to Start an Exchange or Report Damage?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Contact our support team via WhatsApp or email with your order
              number and details.
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
