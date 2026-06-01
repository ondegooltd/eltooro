"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  Shield,
  Smartphone,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function PaymentsHelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/help">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-iherb-green" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    Payment Methods & Billing
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Learn about our accepted payment methods and billing process
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Accepted Payment Methods */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Accepted Payment Methods
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <CreditCard className="h-5 w-5 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Credit & Debit Cards
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We accept all major credit and debit cards including
                        Visa, MasterCard, and American Express. Cards are
                        processed securely through our payment partners.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Mobile Money (MoMo)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        For customers in Ghana, we accept Mobile Money payments
                        through MTN, Vodafone, and AirtelTigo. Fast and
                        convenient payment option.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">
                        Direct bank transfers are available for Ghanaian
                        customers. Payment instructions will be provided during
                        checkout.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-iherb-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">
                        Secure Payment Gateway
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        All payments are processed through secure, PCI-compliant
                        payment gateways. Your payment information is encrypted
                        and never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Process */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Payment Process</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-iherb-green rounded-full flex items-center justify-center shrink-0 text-white font-semibold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Add Items to Cart</h3>
                      <p className="text-sm text-muted-foreground">
                        Browse our products and add items to your shopping cart.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-iherb-green rounded-full flex items-center justify-center shrink-0 text-white font-semibold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Proceed to Checkout
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Review your order and enter your delivery information.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-iherb-green rounded-full flex items-center justify-center shrink-0 text-white font-semibold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">
                        Select Payment Method
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred payment method from the available
                        options.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-iherb-green rounded-full flex items-center justify-center shrink-0 text-white font-semibold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Complete Payment</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter your payment details securely. You'll receive a
                        confirmation email once payment is processed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Information */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Billing Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Billing Address</h3>
                    <p className="text-sm text-muted-foreground">
                      Your billing address should match the address associated
                      with your payment method. This helps prevent payment
                      processing delays.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Invoice & Receipts</h3>
                    <p className="text-sm text-muted-foreground">
                      After completing your purchase, you'll receive an email
                      confirmation with your order details and receipt. You can
                      also access your invoices from your account dashboard.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Currency</h3>
                    <p className="text-sm text-muted-foreground">
                      Prices are displayed in Ghana Cedis (GHS) for local
                      customers and US Dollars (USD) for international
                      customers. Currency conversion is handled automatically
                      during checkout.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Security */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Payment Security
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">SSL Encryption:</span>{" "}
                        All payment transactions are encrypted using SSL
                        technology.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">PCI Compliance:</span>{" "}
                        We comply with PCI DSS standards to ensure secure
                        payment processing.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">No Card Storage:</span>{" "}
                        We do not store your full card details on our servers.
                        Payment information is handled by our secure payment
                        partners.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold">Fraud Protection:</span>{" "}
                        Our payment systems include advanced fraud detection to
                        protect your transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Questions */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Common Payment Questions
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      When will I be charged?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Payment is processed immediately when you complete your
                      order. For pre-orders or backordered items, you may be
                      charged when the item ships.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">
                      What if my payment is declined?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      If your payment is declined, please check that your card
                      information is correct and that you have sufficient funds.
                      Contact your bank if the issue persists.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">
                      Can I use multiple payment methods?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Currently, we accept one payment method per order. You can
                      split payments by placing separate orders if needed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">
                      Are there any payment fees?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We do not charge additional fees for using credit or debit
                      cards. Mobile Money transactions may have standard network
                      fees applied by your mobile money provider.
                    </p>
                  </div>
                </div>
              </div>

              {/* Need More Help */}
              <div className="bg-card border rounded-lg p-6 text-center">
                <h2 className="text-xl font-semibold mb-2">Still Need Help?</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about payments or billing, our support
                  team is here to help.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/contact">
                    <Button variant="outline">Contact Support</Button>
                  </Link>
                  <Link href="/help">
                    <Button>Back to Help Center</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
