"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductListings } from "@/components/product-listings";
import { ProductFilters } from "@/components/product-filters";
import { ProductSort } from "@/components/product-sort";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categoryName, setCategoryName] = useState<string>("All Products");
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  const category = searchParams.get("category") || "all";
  const type = searchParams.get("type"); // trending, best-sellers, new-arrivals, recommended
  const searchQuery = searchParams.get("q");

  useEffect(() => {
    // Set page title based on search query, type, or category
    if (searchQuery) {
      setCategoryName(`Search results for "${searchQuery}"`);
      setIsLoadingCategory(false);
    } else if (type === "trending") {
      setCategoryName("Trending Now");
      setIsLoadingCategory(false);
    } else if (type === "best-sellers") {
      setCategoryName("Best Sellers");
      setIsLoadingCategory(false);
    } else if (type === "new-arrivals") {
      setCategoryName("New Arrivals");
      setIsLoadingCategory(false);
    } else if (type === "recommended") {
      setCategoryName("Recommended for You");
      setIsLoadingCategory(false);
    } else if (category && category !== "all") {
      // Fetch category name if category slug is provided
      fetchCategoryName(category);
    } else {
      setCategoryName("All Products");
      setIsLoadingCategory(false);
    }
  }, [category, type]);

  const fetchCategoryName = async (categorySlug: string) => {
    try {
      setIsLoadingCategory(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        const foundCategory = data.data.find(
          (cat: any) => cat.slug === categorySlug
        );
        if (foundCategory) {
          setCategoryName(foundCategory.name);
        } else {
          setCategoryName("All Products");
        }
      }
    } catch (error) {
      console.error("Failed to fetch category:", error);
      setCategoryName("All Products");
    } finally {
      setIsLoadingCategory(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-muted-foreground">
              <ol className="flex items-center gap-2">
                <li>
                  <a href="/" className="hover:text-iherb-green">
                    Home
                  </a>
                </li>
                <li>/</li>
                <li>
                  <a href="/products" className="hover:text-iherb-green">
                    Products
                  </a>
                </li>
                {(category !== "all" || type || searchQuery) && (
                  <>
                    <li>/</li>
                    <li className="text-foreground font-medium">
                      {isLoadingCategory ? (
                        <Skeleton className="h-4 w-24 inline-block" />
                      ) : (
                        categoryName
                      )}
                    </li>
                  </>
                )}
              </ol>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                {isLoadingCategory ? (
                  <Skeleton className="h-6 sm:h-8 w-32" />
                ) : (
                  categoryName
                )}
              </h1>
              <ProductListings showCount={true} />
            </div>
            <div className="shrink-0">
              <ProductSort />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <ProductFilters />
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <ProductListings />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
