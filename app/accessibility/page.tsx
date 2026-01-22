import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Accessibility, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Accessibility Statement - Eltooro Ghana",
  description:
    "Eltooro is committed to making our website accessible to everyone. Learn about our accessibility features, WCAG compliance, and how we ensure an inclusive shopping experience for all users.",
  keywords: [
    "Eltooro accessibility",
    "website accessibility Ghana",
    "WCAG compliance",
    "accessible shopping",
    "inclusive design",
    "screen reader support",
    "keyboard navigation",
    "accessibility features",
  ],
  url: "https://www.eltooro.com/accessibility",
});

const features = [
  "Keyboard navigation support throughout the website",
  "Screen reader compatibility with ARIA labels",
  "Clear heading structure for easy navigation",
  "Sufficient color contrast for text readability",
  "Alt text for all meaningful images",
  "Resizable text without loss of functionality",
  "Focus indicators for interactive elements",
  "Skip navigation links for screen reader users",
];

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <Accessibility className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Accessibility Statement
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Eltooro is committed to making our website accessible to everyone
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Our Commitment</h2>
              <p className="text-muted-foreground mb-8">
                At Eltooro, we believe that everyone deserves equal access to
                health and wellness products. We are committed to ensuring that
                our website is accessible to people with disabilities, including
                those who use assistive technologies such as screen readers,
                keyboard-only navigation, and other accessibility tools.
              </p>

              <h2 className="text-2xl font-bold mb-6">
                Accessibility Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mb-6">Standards Compliance</h2>
              <p className="text-muted-foreground mb-4">
                We strive to conform to the Web Content Accessibility Guidelines
                (WCAG) 2.1 Level AA standards. These guidelines explain how to
                make web content more accessible for people with disabilities,
                and user friendly for everyone.
              </p>
              <p className="text-muted-foreground mb-8">
                We regularly audit our website and work to identify and fix
                accessibility issues. Our development team receives ongoing
                training on accessibility best practices.
              </p>

              <h2 className="text-2xl font-bold mb-6">
                Assistive Technology Support
              </h2>
              <p className="text-muted-foreground mb-8">
                Our website is designed to be compatible with assistive
                technologies including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-8">
                <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
                <li>Browser accessibility extensions</li>
              </ul>

              <h2 className="text-2xl font-bold mb-6">
                Feedback and Assistance
              </h2>
              <p className="text-muted-foreground mb-4">
                We welcome your feedback on the accessibility of our website. If
                you encounter any accessibility barriers or have suggestions for
                improvement, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-5 w-5 text-iherb-green" />
                  <span className="font-medium">accessibility@Eltooro.com</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please include the specific page URL and a description of the
                  issue you encountered. We aim to respond to accessibility
                  feedback within 2 business days.
                </p>
              </div>

              <h2 className="text-2xl font-bold mb-6">
                Alternative Shopping Options
              </h2>
              <p className="text-muted-foreground mb-8">
                If you have difficulty using our website, our customer service
                team is available to assist you with placing orders or finding
                information. Please call us at 1-800-Eltooro (44372) or use our
                live chat feature.
              </p>

              <div className="text-center">
                <Link href="/contact">
                  <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                    Contact Us for Assistance
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
