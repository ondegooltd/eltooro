import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { generateMetadata } from "@/lib/seo/metadata";
import { Metadata } from "next";

export const metadata: Metadata = generateMetadata({
  title: "Blog - Health & Wellness Articles | Eltooro Ghana",
  description:
    "Read health and wellness articles, beauty tips, and product guides from Eltooro. Learn about organic hair care, natural skincare, supplements, and wellness. Expert advice for your natural beauty journey.",
  keywords: [
    "Eltooro blog",
    "health and wellness blog Ghana",
    "organic beauty tips",
    "natural hair care tips",
    "skincare advice Ghana",
    "wellness articles",
    "beauty blog Ghana",
    "organic products guide",
    "health tips Ghana",
    "natural beauty advice",
  ],
  url: "https://www.eltooro.com/blog",
});

const featuredPost = {
  id: 1,
  title: "The Complete Guide to Vitamin D: Benefits, Sources, and Dosage",
  excerpt:
    "Discover everything you need to know about vitamin D, from its essential health benefits to the best ways to maintain optimal levels year-round.",
  image: "/vitamin-d-sunshine-health.jpg",
  category: "Supplements",
  author: "Dr. Sarah Chen",
  date: "January 8, 2026",
  readTime: "8 min read",
};

const blogPosts = [
  {
    id: 2,
    title: "10 Natural Ways to Boost Your Immune System",
    excerpt:
      "Learn science-backed strategies to strengthen your immunity naturally.",
    image: "/immune-system-health-vegetables.jpg",
    category: "Wellness",
    author: "Dr. Michael Park",
    date: "January 5, 2026",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Best Protein Powders for Building Muscle in 2026",
    excerpt:
      "Our experts review the top protein supplements for your fitness goals.",
    image: "/protein-powder-fitness-gym.jpg",
    category: "Sports",
    author: "James Wilson",
    date: "January 3, 2026",
    readTime: "10 min read",
  },
  {
    id: 4,
    title: "Clean Beauty: What Does It Really Mean?",
    excerpt:
      "Understanding the clean beauty movement and what to look for in products.",
    image: "/natural-beauty-skincare-products.jpg",
    category: "Beauty",
    author: "Emma Rodriguez",
    date: "December 30, 2025",
    readTime: "5 min read",
  },
  {
    id: 5,
    title: "The Gut-Brain Connection: How Probiotics Affect Mental Health",
    excerpt:
      "Exploring the fascinating link between gut health and cognitive function.",
    image: "/gut-health-probiotics-brain.jpg",
    category: "Supplements",
    author: "Dr. Sarah Chen",
    date: "December 28, 2025",
    readTime: "7 min read",
  },
  {
    id: 6,
    title: "Meal Prep 101: A Beginner's Guide to Healthy Eating",
    excerpt:
      "Simple strategies to plan and prepare nutritious meals for the week.",
    image: "/meal-prep-containers-healthy-food.jpg",
    category: "Nutrition",
    author: "Lisa Thompson",
    date: "December 25, 2025",
    readTime: "8 min read",
  },
  {
    id: 7,
    title: "Essential Oils for Better Sleep: A Complete Guide",
    excerpt:
      "Discover which essential oils can help you achieve restful sleep naturally.",
    image: "/essential-oils-aromatherapy-sleep.jpg",
    category: "Wellness",
    author: "Dr. Michael Park",
    date: "December 22, 2025",
    readTime: "6 min read",
  },
];

const categories = [
  "All",
  "Supplements",
  "Wellness",
  "Beauty",
  "Sports",
  "Nutrition",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Eltooro Blog
            </h1>
            <p className="text-xl text-white/90 text-center max-w-2xl mx-auto mb-8">
              Your source for health tips, wellness advice, and product insights
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10 bg-white text-foreground border-0"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              {categories.map((category, index) => (
                <Button
                  key={category}
                  variant={index === 0 ? "default" : "outline"}
                  className={
                    index === 0
                      ? "bg-iherb-green hover:bg-iherb-green-dark"
                      : ""
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
            <Link href={`/blog/${featuredPost.id}`}>
              <div className="grid md:grid-cols-2 gap-8 bg-muted rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 md:h-auto">
                  <Image
                    src={featuredPost.image || "/placeholder.svg"}
                    alt={featuredPost.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-iherb-green">
                    {featuredPost.category}
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredPost.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.date}
                    </span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article className="bg-card rounded-lg overflow-hidden border hover:shadow-md transition-shadow h-full">
                    <div className="relative h-48">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <Badge variant="secondary" className="mb-3">
                        {post.category}
                      </Badge>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button variant="outline" size="lg">
                Load More Articles
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Subscribe to our newsletter for the latest health tips and
              exclusive offers.
            </p>
            <div className="flex max-w-md mx-auto gap-2">
              <Input type="email" placeholder="Enter your email" />
              <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
