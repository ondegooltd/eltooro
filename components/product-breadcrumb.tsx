"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductBreadcrumbProps {
  productId: string;
}

interface Product {
  name: string;
  category: {
    main: string;
    sub?: string;
  };
}

export function ProductBreadcrumb({ productId }: ProductBreadcrumbProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
      </nav>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 overflow-x-auto">
      <Link
        href="/"
        className="flex items-center hover:text-iherb-green shrink-0"
      >
        <Home className="h-4 w-4" />
      </Link>
      <ChevronRight className="h-4 w-4 shrink-0" />
      <Link
        href={`/products?category=${product.category.main}`}
        className="hover:text-iherb-green shrink-0"
      >
        {product.category.main}
      </Link>
      {product.category.sub && (
        <>
          <ChevronRight className="h-4 w-4 shrink-0" />
          <Link
            href={`/products?category=${product.category.sub}`}
            className="hover:text-iherb-green shrink-0"
          >
            {product.category.sub}
          </Link>
        </>
      )}
      <ChevronRight className="h-4 w-4 shrink-0" />
      <span className="text-foreground line-clamp-1">{product.name}</span>
    </nav>
  );
}
