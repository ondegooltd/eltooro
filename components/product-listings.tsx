"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "./product-card";
import { ProductCardSkeleton } from "./product-card-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  images: Array<{ url: string; alt: string }>;
  price: { ghs: number; usd?: number } | number;
  originalPrice?: { ghs: number; usd?: number };
  rating: { average: number; count: number };
}

interface ProductListingsProps {
  showCount?: boolean;
}

export function ProductListings({ showCount = false }: ProductListingsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 1,
  });

  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const type = searchParams.get("type"); // trending, best-sellers, new-arrivals, recommended
  const searchQuery = searchParams.get("q");

  useEffect(() => {
    fetchProducts();
  }, [
    page,
    category,
    brand,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    type,
    searchQuery,
  ]);

  // Delayed loading indicator - only show after 300ms to avoid flashing
  useEffect(() => {
    if (isLoading || isPending) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isLoading, isPending]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setShowLoading(false); // Reset immediately

      // Use search API if search query is present
      if (searchQuery && searchQuery.trim()) {
        const params = new URLSearchParams();
        params.set("q", searchQuery.trim());
        params.set("page", page.toString());
        params.set("limit", "24");

        const response = await fetch(
          `/api/products/search?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setProducts(data.data || []);
          if (data.meta?.pagination) {
            setPagination(data.meta.pagination);
          }
        }
      } else {
        // Use regular products API
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("limit", "24");
        if (type) {
          params.set("type", type);
        }
        if (category && category !== "all") {
          params.set("category", category);
        }
        if (brand) {
          params.set("brand", brand);
        }
        if (minPrice) {
          params.set("minPrice", minPrice);
        }
        if (maxPrice) {
          params.set("maxPrice", maxPrice);
        }
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setProducts(data.data || []);
          if (data.meta?.pagination) {
            setPagination(data.meta.pagination);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePage = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`/products?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
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

  // Generate page numbers to show
  const getPageNumbers = () => {
    const current = pagination.page;
    const total = pagination.totalPages;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push("...");
      }

      // Always show last page
      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  };

  const isPendingOrLoading = showLoading && (isLoading || isPending);

  if (showCount) {
    return (
      <p className="text-muted-foreground mt-1">
        {isPendingOrLoading ? (
          <Skeleton className="h-4 w-48 inline-block" />
        ) : (
          `Showing ${(pagination.page - 1) * pagination.limit + 1}-${Math.min(
            pagination.page * pagination.limit,
            pagination.total
          )} of ${pagination.total.toLocaleString()} results`
        )}
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Product Grid with smooth transitions */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isPendingOrLoading && "opacity-60"
        )}
      >
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={formatProduct(product)} />
            ))}
          </div>
        ) : !isLoading && !isPending ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No products found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : null}
      </div>

      {/* Overlay skeleton loader - only shows after delay */}
      {isPendingOrLoading && (
        <div
          className={cn(
            "absolute inset-0 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 transition-opacity duration-300",
            showLoading ? "opacity-100" : "opacity-0"
          )}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && !showLoading && products.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <>
          <div
            className={cn(
              "mt-8 flex items-center justify-center gap-2 flex-wrap transition-opacity duration-300",
              isPendingOrLoading && "opacity-50 pointer-events-none"
            )}
          >
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1 || isPendingOrLoading}
              onClick={() => updatePage(pagination.page - 1)}
              className="transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              const pageNumber = pageNum as number;
              return (
                <Button
                  key={pageNumber}
                  variant={
                    pagination.page === pageNumber ? "default" : "outline"
                  }
                  size="icon"
                  onClick={() => updatePage(pageNumber)}
                  disabled={isPendingOrLoading}
                  className={cn(
                    "transition-all disabled:opacity-50",
                    pagination.page === pageNumber &&
                      "bg-iherb-green hover:bg-iherb-green-dark text-white"
                  )}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={
                pagination.page === pagination.totalPages || isPendingOrLoading
              }
              onClick={() => updatePage(pagination.page + 1)}
              className="transition-all disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Info */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Showing page {pagination.page} of {pagination.totalPages}
          </p>
        </>
      )}
    </div>
  );
}
