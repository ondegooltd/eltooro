import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Shield, Lock, Mail, Eye, FileText } from "lucide-react";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Privacy Policy - Eltooro Ghana",
  description:
    "Eltooro Privacy Policy. Learn how we collect, use, and protect your personal information. Compliant with Ghana Data Protection Act 2012. Your privacy matters to us. Read our complete privacy policy.",
  keywords: [
    "Eltooro privacy policy",
    "data protection Ghana",
    "privacy policy Ghana",
    "Eltooro data protection",
    "Ghana Data Protection Act",
    "privacy policy organic store",
    "customer data protection",
    "online privacy Ghana",
    "data security Eltooro",
    "personal information protection",
  ],
  url: "https://www.eltooro.com/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-iherb-green text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-white/80">Effective Date: 27th January 2026</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Introduction */}
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Your privacy matters to us. Eltooro collects and uses personal
                  information only to provide a safe, reliable, and smooth shopping
                  experience. This Privacy Policy explains how we collect, use,
                  protect, and handle your personal information when you use our
                  platform.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  By using Eltooro, you agree to the collection and use of
                  information in accordance with this policy. We are committed to
                  protecting your privacy and ensuring the security of your personal
                  data.
                </p>
              </div>

              {/* What We Collect */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">What We Collect</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Personal Information
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      When you create an account, place an order, or contact us, we
                      collect:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Name, email address, and phone number</li>
                      <li>Delivery address and billing information</li>
                      <li>Account credentials (username, password)</li>
                      <li>Profile preferences and settings</li>
              </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Order and Payment Details
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      To process your orders, we collect:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Order history and purchase details</li>
                      <li>
                        Payment information (processed securely by third-party
                        providers; we do not store full credit card numbers)
                </li>
                      <li>Shipping preferences and tracking information</li>
                      <li>Return and refund history</li>
              </ul>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      Note: Payments are processed securely by third-party payment
                      providers. Eltooro does not store your complete payment card
                      information on our servers.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Website Usage Data
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      When you browse our website, we automatically collect:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Cookies and similar tracking technologies</li>
                      <li>Device information (type, operating system, browser)</li>
                      <li>IP address and location data (general area only)</li>
                      <li>Pages visited, time spent, and navigation patterns</li>
                      <li>Referring website addresses</li>
                      <li>Search queries and product views</li>
              </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">How We Use Your Information</h2>
                </div>
                <div className="space-y-4">
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      To Process and Deliver Your Orders
                    </h3>
                    <p className="text-muted-foreground">
                      We use your personal information to process orders, arrange
                      shipping, provide order confirmations, and handle returns or
                      refunds. This includes sharing necessary information with
                      shipping partners and payment processors to complete your
                      transactions.
                    </p>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      To Communicate with You About Purchases and Support
                    </h3>
                    <p className="text-muted-foreground">
                      We send order confirmations, shipping updates, delivery
                      notifications, and respond to your inquiries, requests, or
                      support needs. We may also contact you about your account or
                      transactions to ensure security and prevent fraud.
                    </p>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      To Improve Our Website and Services
                    </h3>
                    <p className="text-muted-foreground">
                      We analyze usage patterns, customer feedback, and website
                      performance to enhance user experience, optimize our platform,
                      develop new features, and improve product recommendations. This
                      helps us provide you with a better shopping experience.
                    </p>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">
                      To Send Updates or Promotions (Only If You Consent)
                    </h3>
                    <p className="text-muted-foreground">
                      With your explicit consent, we may send you marketing
                      communications, promotional offers, newsletters, and product
                      updates. You can opt-out of these communications at any time
                      through your account settings or by clicking the unsubscribe
                      link in our emails.
                    </p>
                  </div>
                  <div className="border-l-4 border-iherb-green pl-4">
                    <h3 className="font-semibold mb-2">Other Uses</h3>
                    <p className="text-muted-foreground">
                      We may also use your information to comply with legal
                      obligations, enforce our terms of service, protect our rights
                      and security, prevent fraud, and respond to legal requests or
                      court orders.
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Protection */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Data Protection</h2>
                </div>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Security Measures</h3>
                    <p className="text-muted-foreground mb-2">
                      We protect your data using reasonable security measures
                      including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Encryption of sensitive data in transit and at rest</li>
                      <li>Secure payment processing through certified providers</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication measures</li>
                      <li>Employee training on data protection</li>
              </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Legal Compliance
                    </h3>
                    <p className="text-muted-foreground">
                      We comply with the Ghana Data Protection Act, 2012 (Act 843)
                      and applicable international data protection laws, including
                      GDPR for European customers. We are committed to maintaining
                      the highest standards of data protection and privacy.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      We Do Not Sell Your Information
                    </h3>
                    <p className="text-muted-foreground">
                      Eltooro does not sell, rent, or trade your personal information
                      to third parties for their marketing purposes. We may share
                      information only with trusted service providers who assist us in
                      operating our platform, conducting our business, or serving our
                      customers, and only under strict confidentiality agreements.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Data Retention</h3>
                    <p className="text-muted-foreground">
                      We retain your personal information only for as long as
                      necessary to fulfill the purposes outlined in this policy,
                      comply with legal obligations, resolve disputes, and enforce
                      our agreements. When data is no longer needed, we securely
                      delete or anonymize it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Your Rights</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Under applicable data protection laws, including the Ghana Data
                    Protection Act, 2012 (Act 843), you have the following rights
                    regarding your personal information:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Access</h3>
                      <p className="text-sm text-muted-foreground">
                        You may request a copy of the personal information we hold
                        about you.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Correction</h3>
                      <p className="text-sm text-muted-foreground">
                        You may request correction of inaccurate or incomplete
                        information.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Deletion</h3>
                      <p className="text-sm text-muted-foreground">
                        You may request deletion of your personal information, subject
                        to legal and contractual obligations.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Object</h3>
                      <p className="text-sm text-muted-foreground">
                        You may object to certain processing of your personal
                        information, including direct marketing.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Data Portability</h3>
                      <p className="text-sm text-muted-foreground">
                        You may request transfer of your data to another service
                        provider in a structured format.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Right to Withdraw Consent</h3>
                      <p className="text-sm text-muted-foreground">
                        You may withdraw consent for processing where consent is the
                        legal basis.
                      </p>
                    </div>
                  </div>
                  <div className="bg-iherb-green/10 border border-iherb-green/20 rounded-lg p-4">
                    <p className="text-muted-foreground">
                      <strong className="text-foreground">To exercise these rights:</strong>{" "}
                      Contact us at{" "}
                      <a
                        href="mailto:Eltoorosupport@gmail.com"
                        className="text-iherb-green hover:underline font-medium"
                      >
                        Eltoorosupport@gmail.com
                      </a>{" "}
                      with your request. We will respond within a reasonable time
                      frame and may require verification of your identity to protect
                      your privacy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar tracking technologies to enhance your
                  browsing experience, analyze website traffic, personalize content,
                  and remember your preferences. Cookies are small text files stored
                  on your device.
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Essential Cookies:</strong>{" "}
                    Required for the website to function properly (e.g., shopping
                    cart, authentication).
                  </p>
                  <p>
                    <strong className="text-foreground">Analytics Cookies:</strong>{" "}
                    Help us understand how visitors use our website to improve
                    performance.
                  </p>
                  <p>
                    <strong className="text-foreground">Preference Cookies:</strong>{" "}
                    Remember your settings and preferences for a personalized
                    experience.
                  </p>
                  <p>
                    <strong className="text-foreground">Marketing Cookies:</strong>{" "}
                    Used to deliver relevant advertisements (only with your consent).
                  </p>
                </div>
                <p className="text-muted-foreground mt-4">
                  You can manage cookie preferences through your browser settings.
                  Note that disabling certain cookies may affect website
                  functionality.
                </p>
              </div>

              {/* Third-Party Services */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Third-Party Services</h2>
                <p className="text-muted-foreground mb-4">
                  We may use third-party services that collect, monitor, and analyze
                  information to help us operate and improve our platform. These
                  services include:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Payment processors for secure transaction processing</li>
                  <li>Shipping and logistics partners for order fulfillment</li>
                  <li>Analytics services to understand website usage</li>
                  <li>Customer support platforms for assistance</li>
                  <li>Email service providers for communications</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  These third parties are contractually obligated to protect your
                  information and use it only for the purposes we specify.
                </p>
              </div>

              {/* International Transfers */}
              <div>
                <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries
                  other than your own, including countries outside Ghana. We ensure
                  appropriate safeguards are in place for such transfers, including
                  standard contractual clauses and compliance with applicable data
                  protection laws.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Children&apos;s Privacy</h2>
                <p className="text-muted-foreground">
                  Our platform is not intended for children under 18 years of age. We
                  do not knowingly collect personal information from children. If you
                  are a parent or guardian and believe your child has provided us with
                  personal information, please contact us immediately, and we will
                  delete such information.
                </p>
              </div>

              {/* Changes to Policy */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, technology, legal requirements, or other
                  factors. We will notify you of any material changes by posting the
                  updated policy on this page and updating the &quot;Effective Date&quot;
                  at the top. We encourage you to review this policy periodically to
                  stay informed about how we protect your information.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-muted/50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-6 w-6 text-iherb-green" />
                  <h2 className="text-2xl font-bold">Contact Us</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  If you have questions, concerns, or requests regarding this Privacy
                  Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Email:</strong>{" "}
                    <a
                      href="mailto:Eltoorosupport@gmail.com"
                      className="text-iherb-green hover:underline"
                    >
                      Eltoorosupport@gmail.com
                    </a>
                  </p>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Subject Line:</strong> Privacy
                    Policy Inquiry
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  We will respond to your inquiry within a reasonable time frame and
                  work with you to address any concerns.
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
