"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/contexts/wishlist-context";
import { useCart } from "@/contexts/cart-context";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { items, isLoading, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  const handleRemoveItem = async (productId: string) => {
    setIsRemoving(productId);
    try {
      await removeItem(productId);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setIsAddingToCart(productId);
    try {
      await addToCart(productId, 1);
    } finally {
      setIsAddingToCart(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48 mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-red-500" />
                My Wishlist
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {items.length} items saved
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    className="bg-card border rounded-lg overflow-hidden group"
                  >
                    <div className="relative">
                      <div className="relative h-48 bg-white">
                        <Link href={`/product/${product.slug || product._id}`}>
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                          />
                        </Link>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        disabled={isRemoving === item.productId}
                        title="Remove from wishlist"
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    <div className="p-4">
                      {product.brand && (
                        <p className="text-sm text-muted-foreground">
                          {product.brand}
                        </p>
                      )}
                      <Link href={`/product/${product.slug || product._id}`}>
                        <h3 className="font-semibold mb-2 line-clamp-2 hover:text-iherb-green">
                          {product.name}
                        </h3>
                      </Link>
                      {product.price && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-bold text-iherb-green">
                            GH₵{product.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <Button
                        className="w-full bg-iherb-green hover:bg-iherb-green-dark"
                        onClick={() => handleAddToCart(item.productId)}
                        disabled={isAddingToCart === item.productId}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isAddingToCart === item.productId
                          ? "Adding..."
                          : "Add to Cart"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-muted-foreground mb-6">
                Start adding products you love!
              </p>
              <Button
                className="bg-iherb-green hover:bg-iherb-green-dark"
                asChild
              >
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
