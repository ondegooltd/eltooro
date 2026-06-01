"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

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

export function CategoryTabs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      fetchBestSellers(activeCategory);
    }
  }, [activeCategory]);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setCategories(data.data);
        // Set first category slug as active
        setActiveCategory(data.data[0].slug);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchBestSellers = async (categorySlug: string) => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(
        `/api/products/best-sellers?category=${encodeURIComponent(
          categorySlug
        )}&limit=8`
      );
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch best sellers:", error);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
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

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Best sellers
        </h2>
        <Link
          href="/products?type=best-sellers"
          className="text-xs sm:text-sm text-iherb-green hover:underline font-medium whitespace-nowrap"
        >
          View all
        </Link>
      </div>

      {/* Category Tabs */}
      <div
        className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoadingCategories
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))
          : categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setActiveCategory(category.slug)}
                className={cn(
                  "px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors min-h-[2.5rem]",
                  activeCategory === category.slug
                    ? "bg-iherb-green text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {category.name}
              </button>
            ))}
      </div>

      {/* Products Grid */}
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
          {/* Show loading skeletons only when initially loading or switching categories */}
          {isLoadingProducts && products.length === 0 ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton
                key={i}
                className="shrink-0 w-[160px] sm:w-[200px]"
              />
            ))
          ) : (
            <>
              {/* Show existing products with reduced opacity while loading new ones */}
              <div
                className={cn(
                  "flex gap-4 transition-opacity duration-300",
                  isLoadingProducts && products.length > 0
                    ? "opacity-40 pointer-events-none"
                    : "opacity-100"
                )}
              >
                {products.length > 0 ? (
                  products.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={formatProduct(product)}
                      className="shrink-0 w-[160px] sm:w-[200px]"
                    />
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8 w-full">
                    No best sellers found for this category
                  </div>
                )}
              </div>

              {/* Show loading overlay when switching categories */}
              {isLoadingProducts && products.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-20">
                  <div className="flex gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <ProductCardSkeleton
                        key={i}
                        className="shrink-0 w-[160px] sm:w-[200px]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
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
