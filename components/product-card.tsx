"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    image: string;
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: number;
    currency?: string;
  };
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem: addToCart } = useCart();
  const {
    isWishlisted: checkWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const isWishlisted = checkWishlisted(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsTogglingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative bg-white rounded-lg border border-border hover:shadow-lg transition-shadow flex flex-col",
        className
      )}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        disabled={isTogglingWishlist}
        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 p-1 sm:p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity disabled:opacity-50"
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={cn(
            "h-3 w-3 sm:h-4 sm:w-4 transition-colors",
            isWishlisted
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground hover:text-red-500"
          )}
        />
      </button>

      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded">
          -{discount}%
        </div>
      )}

      <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
        {/* Product Image - fills width and height with no empty space */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Product Info */}
        <div className="px-2 sm:p-3 flex-1 flex flex-col">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1 line-clamp-1">
            {product.brand}
          </p>
          <h3 className="text-[11px] sm:text-sm font-medium text-foreground line-clamp-2 mb-1.5 sm:mb-2 min-h-8 sm:min-h-10 leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-0.5 sm:gap-1 mb-1.5 sm:mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-2.5 w-2.5 sm:h-3 sm:w-3",
                    i < Math.floor(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {product.reviewCount.toLocaleString()}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg font-bold text-foreground">
              {product.currency || "GH₵"}
              {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                {product.currency || "GH₵"}
                {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="px-2 pb-2 sm:px-3 sm:pb-3">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-iherb-green hover:bg-iherb-green-dark text-white h-8 sm:h-10 md:h-11 text-[11px] sm:text-sm md:text-base min-h-8 sm:min-h-10"
        >
          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          {isAddingToCart ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
