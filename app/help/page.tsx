"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Package,
  CreditCard,
  Truck,
  RotateCcw,
  User,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  question: string;
  answer: string;
  category?: string;
}

const helpCategories = [
  {
    icon: Package,
    title: "Orders",
    description: "Track, modify, or cancel orders",
    href: "/orders",
    category: "orders",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods and billing",
    href: "/help/payments",
    category: "payments",
  },
  {
    icon: Truck,
    title: "Shipping",
    description: "Delivery times and tracking",
    href: "/shipping",
    category: "shipping",
  },
  {
    icon: RotateCcw,
    title: "Returns",
    description: "Return policy and refunds",
    href: "/returns",
    category: "returns",
  },
  {
    icon: User,
    title: "Account",
    description: "Manage your account settings",
    href: "/account",
    category: "account",
  },
  {
    icon: MessageCircle,
    title: "Products",
    description: "Product info and recommendations",
    href: "/products",
    category: "products",
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery);
    } else {
      filterFAQsByCategory();
    }
  }, [debouncedSearchQuery, selectedCategory]);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/help/faqs");
      const data = await response.json();
      if (data.success) {
        setFaqs(data.data || []);
        setFilteredFAQs(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      setFaqs([]);
      setFilteredFAQs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/help/faqs?search=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (data.success) {
        setFilteredFAQs(data.data || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      // Fallback to client-side filtering
      filterFAQsByCategory();
    } finally {
      setIsLoading(false);
    }
  };

  const filterFAQsByCategory = () => {
    if (selectedCategory) {
      setFilteredFAQs(faqs.filter((faq) => faq.category === selectedCategory));
    } else {
      setFilteredFAQs(faqs);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim());
    } else {
      setFilteredFAQs(faqs);
      setSelectedCategory(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setFilteredFAQs(faqs);
  };

  const handleCategoryClick = (category: string, href: string) => {
    setSelectedCategory(category);
    // Filter FAQs by category
    setFilteredFAQs(faqs.filter((faq) => faq.category === category));
    // Optionally navigate to the category page
    if (href.startsWith("/")) {
      router.push(href);
    }
  };

  const handleLiveChat = () => {
    // Open contact page or initiate chat
    router.push("/contact");
  };

  const handlePhoneSupport = () => {
    // Open phone dialer or show phone number
    window.location.href = "tel:+233XXXXXXXXX";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Help Center
            </h1>
            <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8">
              How can we help you today?
            </p>
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-xl mx-auto relative"
            >
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-10" />
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 sm:pl-12 pr-8 sm:pr-10 py-4 sm:py-6 text-base sm:text-lg bg-white text-foreground border-0"
              />
              {searchQuery && (
                <button
                  title="Clear Search"
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </form>
            {searchQuery && (
              <p className="text-sm text-white/80 mt-2">
                {filteredFAQs.length} result
                {filteredFAQs.length !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-center">
              Browse by Topic
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {helpCategories.map((category) => (
                <button
                  key={category.title}
                  onClick={() =>
                    handleCategoryClick(category.category, category.href)
                  }
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border rounded-lg hover:border-iherb-green hover:bg-iherb-green/5 transition-colors text-left w-full"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-iherb-green/10 rounded-full flex items-center justify-center shrink-0">
                    <category.icon className="h-5 w-5 sm:h-6 sm:w-6 text-iherb-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {category.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 sm:py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold">
                {selectedCategory
                  ? `${
                      helpCategories.find(
                        (c) => c.category === selectedCategory
                      )?.title
                    } FAQs`
                  : searchQuery
                  ? "Search Results"
                  : "Frequently Asked Questions"}
              </h2>
              {(selectedCategory || searchQuery) && (
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="text-xs sm:text-sm w-full sm:w-auto"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            <div className="max-w-3xl mx-auto">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-card border rounded-lg px-6 py-4"
                    >
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : filteredFAQs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="bg-card border rounded-lg px-6"
                    >
                      <AccordionTrigger className="text-left font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? `No results found for "${searchQuery}"`
                      : "No FAQs available at this time."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8 text-center">
              Still Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with our support team in real-time
                </p>
                <Button
                  onClick={handleLiveChat}
                  className="bg-iherb-green hover:bg-iherb-green-dark w-full"
                >
                  Start Chat
                </Button>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get a response within 24 hours
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full bg-transparent">
                    Send Email
                  </Button>
                </Link>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <div className="w-14 h-14 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-iherb-green" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Available Mon-Fri, 9AM-6PM GMT
                </p>
                <Button
                  variant="outline"
                  onClick={handlePhoneSupport}
                  className="w-full bg-transparent"
                >
                  Call Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
