"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";

interface Product {
  _id: string;
  name: string;
  brand?: string;
  images: Array<{ url: string; alt: string }>;
  price: { ghs: number; usd?: number } | number;
  originalPrice?: { ghs: number; usd?: number };
  rating: { average: number; count: number };
  slug: string;
}

export function NewArrivals() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/products/new-arrivals?limit=8");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch new arrivals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatProduct = (product: Product) => ({
    id: product.slug || product._id,
    name: product.name,
    brand: product.brand || "",
    image: product.images?.[0]?.url || "/placeholder.svg",
    rating: product.rating?.average || 0,
    reviewCount: product.rating?.count || 0,
    price:
      typeof product.price === "object" ? product.price.ghs : product.price,
    originalPrice: product.originalPrice
      ? typeof product.originalPrice === "object"
        ? product.originalPrice.ghs
        : product.originalPrice
      : undefined,
  });

  return (
    <section className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-iherb-green" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            New arrivals
          </h2>
        </div>
        <Link
          href="/products?type=new-arrivals"
          className="text-xs sm:text-sm text-iherb-green hover:underline font-medium whitespace-nowrap"
        >
          View all
        </Link>
      </div>

      <div className="relative group">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton
                key={i}
                className="shrink-0 w-[160px] sm:w-[200px]"
              />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard
                key={product._id}
                product={formatProduct(product)}
                className="shrink-0 w-[160px] sm:w-[200px]"
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8 w-full">
              No new arrivals found
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}
