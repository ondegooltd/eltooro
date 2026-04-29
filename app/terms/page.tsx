import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  FileText,
  AlertTriangle,
  Shield,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Lock,
  Globe,
  Mail,
} from "lucide-react";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Terms of Service - Toroglo Ghana",
  description:
    "Toroglo Terms of Service. Read our terms and conditions for using our platform. Product disclaimers, shipping policies, returns policy, payment terms, and user responsibilities. Effective January 2026.",
  keywords: [
    "Toroglo terms of service",
    "terms and conditions Ghana",
    "Toroglo user agreement",
    "terms of use Ghana",
    "online store terms",
    "product disclaimer",
    "shipping terms Ghana",
    "return terms Toroglo",
    "payment terms Ghana",
    "user agreement organic store",
  ],
  url: "https://www.toroglo.com/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-iherb-green text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-white/80">Effective Date: 27th January, 2026</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Introduction */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Welcome to Toroglo. By accessing or using our platform, you
                  agree to these Terms of Service. If you do not agree, please
                  discontinue use immediately.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  These Terms govern your access to and use of the Toroglo
                  website, mobile application, and services (collectively, the
                  &quot;Platform&quot;). Please read these Terms carefully
                  before using our services.
                </p>
              </div>

              {/* Eligibility */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Eligibility & Use</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Age Requirement
                    </h3>
                    <p className="text-muted-foreground">
                      You must be at least 18 years old (or the legal age in
                      your jurisdiction) to use our services. By using Toroglo,
                      you represent and warrant that you meet this age
                      requirement and have the legal capacity to enter into
                      these Terms.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Lawful and Responsible Use
                    </h3>
                    <p className="text-muted-foreground">
                      You agree to use Toroglo lawfully and responsibly. You
                      will not:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Violate any applicable laws or regulations</li>
                      <li>Infringe upon the rights of others</li>
                      <li>Transmit harmful, offensive, or illegal content</li>
                      <li>
                        Attempt to gain unauthorized access to our systems
                      </li>
                      <li>Interfere with or disrupt the Platform</li>
                      <li>
                        Use automated systems to access the Platform without
                        permission
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Account Responsibility
                    </h3>
                    <p className="text-muted-foreground">
                      You are responsible for safeguarding your account
                      credentials and all activities under your account. You
                      must immediately notify us of any unauthorized use of your
                      account. Toroglo is not liable for any loss or damage
                      arising from your failure to protect your account
                      information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Disclaimer */}
              <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">
                    Product Disclaimer (Medical & Regulatory)
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
                      Product Classification
                    </h3>
                    <p className="text-red-800 dark:text-red-200">
                      Toroglo products are classified as cosmetic, wellness, or
                      dietary supplement products. These products are not
                      pharmaceutical drugs and are not intended to treat, cure,
                      or prevent diseases.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
                      Important Medical Disclaimer
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-red-800 dark:text-red-200 ml-4">
                      <li>
                        <strong>
                          Products sold on Toroglo are not intended to diagnose,
                          treat, cure, or prevent any disease.
                        </strong>
                      </li>
                      <li>
                        Statements on this platform have not been evaluated by
                        the U.S. Food and Drug Administration (FDA) or
                        equivalent regulatory bodies unless explicitly stated.
                      </li>
                      <li>
                        Results may vary from person to person. Individual
                        results depend on various factors including genetics,
                        lifestyle, and health conditions.
                      </li>
                      <li>
                        <strong>
                          Always consult a qualified healthcare professional
                          before using supplements, hair growth treatments, or
                          wellness products—especially if you are:
                        </strong>
                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                          <li>Pregnant or nursing</li>
                          <li>Taking medication</li>
                          <li>Managing a medical condition</li>
                          <li>Under 18 years of age</li>
                          <li>Planning surgery or medical procedures</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-100">
                      User Responsibility
                    </h3>
                    <p className="text-red-800 dark:text-red-200">
                      You acknowledge that you are using Toroglo products at
                      your own risk. You are responsible for reading product
                      labels, following usage instructions, and consulting
                      healthcare professionals when appropriate. Toroglo is not
                      liable for any adverse reactions or health issues
                      resulting from product use.
                    </p>
                  </div>
                </div>
              </div>

              {/* Regulatory Compliance */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">
                    Regulatory Compliance (Ghana & International)
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">Ghana Regulations</h3>
                    <p className="text-muted-foreground">
                      Products sold in Ghana are intended to comply with
                      applicable regulations, including guidelines from the Food
                      and Drugs Authority (FDA Ghana) where required. We work
                      with suppliers who adhere to local regulatory standards
                      and requirements.
                    </p>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      International Customers
                    </h3>
                    <p className="text-muted-foreground">
                      International customers are responsible for ensuring
                      products comply with import regulations in their country.
                      Different countries have varying regulations regarding
                      supplements, cosmetics, and wellness products. It is your
                      responsibility to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>Check local import regulations before ordering</li>
                      <li>Obtain necessary permits or licenses if required</li>
                      <li>Pay applicable customs duties and taxes</li>
                      <li>Ensure products are legal in your jurisdiction</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      Customs and Restrictions
                    </h3>
                    <p className="text-muted-foreground">
                      Toroglo is not responsible for customs delays, seizures,
                      or regulatory restrictions imposed by foreign authorities.
                      If your order is detained, rejected, or destroyed by
                      customs, we cannot provide refunds unless the issue is due
                      to our error. We recommend researching your country&apos;s
                      import regulations before placing international orders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Orders & Payments */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Orders & Payments</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Order Acceptance
                    </h3>
                    <p className="text-muted-foreground">
                      All orders are subject to availability and acceptance. We
                      reserve the right to refuse or cancel any order at our
                      discretion, including but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mt-2">
                      <li>
                        Orders with incorrect pricing due to system errors
                      </li>
                      <li>Orders that violate our terms or policies</li>
                      <li>Orders for products that are out of stock</li>
                      <li>Suspected fraudulent transactions</li>
                      <li>
                        Orders that cannot be fulfilled for legal or regulatory
                        reasons
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Pricing</h3>
                    <p className="text-muted-foreground">
                      Prices may change without prior notice. While we strive
                      for accuracy, pricing errors may occur. If we discover an
                      error in pricing, we reserve the right to cancel the order
                      or contact you to confirm the correct price. We are not
                      obligated to honor incorrect prices.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Payment Processing
                    </h3>
                    <p className="text-muted-foreground">
                      Payments are processed through secure third-party
                      providers. We do not store your complete payment card
                      information. By providing payment information, you
                      represent that you are authorized to use the payment
                      method. All payments must be received prior to order
                      fulfillment.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Order Limits</h3>
                    <p className="text-muted-foreground">
                      Toroglo reserves the right to cancel or limit quantities
                      at its discretion, including limiting orders per
                      household, per person, or per order. This helps us prevent
                      abuse and ensure fair access to products for all
                      customers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping & Delivery */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Shipping & Delivery</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Delivery timelines depend on location and logistics
                    partners. Estimated delivery dates are provided at checkout
                    but are not guaranteed. Actual delivery times may vary due
                    to various factors.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-2">
                      Toroglo is not liable for delays caused by:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Customs clearance processes and inspections</li>
                      <li>Courier or shipping partner issues</li>
                      <li>Weather conditions or natural disasters</li>
                      <li>
                        Strikes, labor disputes, or transportation disruptions
                      </li>
                      <li>Force majeure events beyond our control</li>
                      <li>Incorrect or incomplete delivery addresses</li>
                      <li>
                        Recipient unavailability or refusal to accept delivery
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Delivery Responsibilities
                    </h3>
                    <p className="text-muted-foreground">
                      Once your order is shipped, tracking information will be
                      provided. You are responsible for ensuring someone is
                      available to receive the delivery. If delivery is
                      attempted and unsuccessful, additional delivery fees may
                      apply. Risk of loss and title pass to you upon delivery to
                      the carrier.
                    </p>
                  </div>
                </div>
              </div>

              {/* Returns & Refunds */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Returns & Refunds</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                    <p className="text-yellow-900 dark:text-yellow-100 font-semibold mb-2">
                      Important: Returns Only Policy
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Toroglo accepts returns only. No refunds are issued.
                      Returned items must be unused, unopened, and in original
                      condition. Products cannot be returned after 7 days of
                      delivery.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Return Conditions
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      To be eligible for return, items must:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Be unused and unopened</li>
                      <li>
                        Be in original packaging with all tags and labels
                        attached
                      </li>
                      <li>Be returned within 7 days of delivery date</li>
                      <li>Not be damaged, altered, or missing components</li>
                      <li>Include original receipt or proof of purchase</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Return Process
                    </h3>
                    <p className="text-muted-foreground">
                      To initiate a return, contact our customer support at{" "}
                      <a
                        href="mailto:info@toroglo.com"
                        className="text-iherb-green hover:underline"
                      >
                        info@toroglo.com
                      </a>{" "}
                      within 7 days of delivery. We will provide return
                      instructions and a return authorization number. Return
                      shipping costs are the customer&apos;s responsibility
                      unless the return is due to our error.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      No Refunds Policy
                    </h3>
                    <p className="text-muted-foreground">
                      Please note that Toroglo operates on a returns-only
                      policy. We do not issue monetary refunds. Upon successful
                      return and inspection, you will receive store credit or a
                      replacement product (subject to availability) at our
                      discretion.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Non-Returnable Items
                    </h3>
                    <p className="text-muted-foreground">
                      Certain items may not be eligible for return, including:
                      personalized products, opened consumables, items damaged
                      by misuse, and products returned after the 7-day window.
                      Final sale items will be clearly marked.
                    </p>
                  </div>
                </div>
              </div>

              {/* Intellectual Property */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Intellectual Property</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6">
                  <p className="text-muted-foreground mb-4">
                    All platform content—including text, images, logos,
                    trademarks, graphics, software, and design elements—is the
                    property of Toroglo or its licensors and is protected by
                    copyright, trademark, and other intellectual property laws.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    You may not use, reproduce, distribute, modify, create
                    derivative works of, publicly display, or exploit any
                    content from the Platform without our express written
                    permission. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>
                      Copying or downloading product images or descriptions
                    </li>
                    <li>Using our trademarks or logos without authorization</li>
                    <li>Reverse engineering or decompiling our software</li>
                    <li>Creating derivative works based on our content</li>
                    <li>Using automated systems to scrape or extract data</li>
                  </ul>
                  <p className="text-muted-foreground mt-4">
                    Unauthorized use of our intellectual property may result in
                    legal action and damages.
                  </p>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">
                    Limitation of Liability
                  </h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <p className="text-muted-foreground">
                    To the fullest extent permitted by law:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>
                      <strong>
                        Toroglo is not liable for indirect, incidental, or
                        consequential damages,
                      </strong>{" "}
                      including but not limited to lost profits, lost data,
                      business interruption, or personal injury, arising from
                      your use of the Platform or products.
                    </li>
                    <li>
                      <strong>
                        Liability is limited to the amount paid for the product
                        in question.
                      </strong>{" "}
                      Our total liability for any claim shall not exceed the
                      purchase price of the specific product giving rise to the
                      claim.
                    </li>
                    <li>
                      <strong>
                        Users assume responsibility for product usage.
                      </strong>{" "}
                      You acknowledge that you use products at your own risk and
                      are responsible for following usage instructions,
                      consulting healthcare professionals when appropriate, and
                      using products as intended.
                    </li>
                    <li>
                      <strong>No warranties are provided</strong> beyond those
                      required by applicable law. We disclaim all warranties,
                      express or implied, including merchantability and fitness
                      for a particular purpose.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modifications to Terms */}
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  Modifications to Terms
                </h2>
                <p className="text-muted-foreground">
                  Toroglo may update these Terms at any time to reflect changes
                  in our services, legal requirements, or business practices. We
                  will notify you of material changes by posting the updated
                  Terms on this page and updating the &quot;Effective
                  Date.&quot; Continued use of the platform after changes
                  constitutes acceptance of revised terms. If you do not agree
                  to the updated Terms, you must discontinue use of the Platform
                  immediately.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                <p className="text-muted-foreground">
                  These Terms are governed by the laws of the Republic of Ghana,
                  without prejudice to applicable international consumer
                  protection laws. Any disputes arising from these Terms or your
                  use of the Platform shall be subject to the exclusive
                  jurisdiction of the courts of Ghana, unless otherwise required
                  by mandatory consumer protection laws in your jurisdiction.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Contact Information</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  For support, legal inquiries, or questions about these Terms
                  of Service, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a
                      href="mailto:info@toroglo.com"
                      className="text-iherb-green hover:underline"
                    >
                      info@toroglo.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Subject Line:</strong>{" "}
                    Terms of Service Inquiry
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  We will respond to your inquiry as soon as possible and work
                  with you to resolve any concerns.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
