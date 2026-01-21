import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";

const pressReleases = [
  {
    id: 1,
    title: "Eltooro Expands Operations in Asia Pacific Region",
    date: "January 5, 2026",
    category: "Expansion",
    excerpt:
      "Eltooro announces new fulfillment center in Singapore to better serve customers in Southeast Asia.",
  },
  {
    id: 2,
    title: "Eltooro Launches Sustainability Initiative",
    date: "December 15, 2025",
    category: "Sustainability",
    excerpt:
      "New eco-friendly packaging and carbon-neutral shipping options now available.",
  },
  {
    id: 3,
    title: "Eltooro Named Top Online Retailer for Health Products",
    date: "November 20, 2025",
    category: "Awards",
    excerpt:
      "Industry recognition for exceptional customer service and product quality.",
  },
  {
    id: 4,
    title: "Eltooro Introduces AI-Powered Product Recommendations",
    date: "October 10, 2025",
    category: "Technology",
    excerpt:
      "New machine learning features help customers find the perfect products for their health goals.",
  },
];

const mediaAssets = [
  { name: "Eltooro Logo Pack", type: "ZIP", size: "2.4 MB" },
  { name: "Executive Photos", type: "ZIP", size: "8.1 MB" },
  { name: "Brand Guidelines", type: "PDF", size: "1.2 MB" },
  { name: "Product Images", type: "ZIP", size: "15.3 MB" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Press & Media
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Latest news, press releases, and media resources
            </p>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-muted p-6 rounded-lg">
              <div>
                <h2 className="text-xl font-semibold mb-2">Media Inquiries</h2>
                <p className="text-muted-foreground">
                  For press inquiries, please contact our media relations team.
                </p>
              </div>
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                <Mail className="h-4 w-4 mr-2" />
                Contact Press Team
              </Button>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release) => (
                <div
                  key={release.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary">{release.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {release.date}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {release.title}
                      </h3>
                      <p className="text-muted-foreground">{release.excerpt}</p>
                    </div>
                    <Button
                      variant="outline"
                      className="shrink-0 bg-transparent"
                    >
                      Read More
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline">View All Press Releases</Button>
            </div>
          </div>
        </section>

        {/* Media Assets */}
        <section className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Media Assets</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mediaAssets.map((asset) => (
                <div key={asset.name} className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {asset.type} • {asset.size}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* In The News */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Eltooro in the News</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden">
                  <div className="relative h-40">
                    <Image
                      src={`/news-article.png?height=200&width=400&query=news article ${i}`}
                      alt="News article"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Forbes • Dec 2025
                    </p>
                    <h3 className="font-semibold">
                      How Eltooro is Revolutionizing Health E-commerce
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
