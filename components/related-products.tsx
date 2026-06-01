"use client";

import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import { Button } from "@/components/ui/button";

interface RelatedProductsProps {
  productId: string;
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

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId]);

  const fetchRelatedProducts = async () => {
    try {
      setIsLoading(true);
      // First get product to get its ID
      const productResponse = await fetch(`/api/products/${productId}`);
      const productData = await productResponse.json();

      if (productData.success && productData.data?._id) {
        const response = await fetch(
          `/api/products/${productData.data._id}/related`
        );
        const data = await response.json();
        if (data.success) {
          setProducts(data.data || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch related products:", error);
    } finally {
      setIsLoading(false);
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
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border p-4 lg:p-6">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Customers Also Bought
        </h2>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent min-w-[2rem] min-h-[2rem]"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent min-w-[2rem] min-h-[2rem]"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton
              key={i}
              className="w-[160px] sm:w-[200px] shrink-0"
            />
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={formatProduct(product)}
              className="w-[160px] sm:w-[200px] shrink-0"
            />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8 w-full">
            No related products found
          </div>
        )}
      </div>
    </div>
  );
}
