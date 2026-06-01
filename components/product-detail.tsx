"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Minus,
  Plus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { cn } from "@/lib/utils";
import { ProductDetailSkeleton } from "@/components/product-detail-skeleton";

interface ProductDetailProps {
  productId: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  images: Array<{ url: string; alt: string; order: number }>;
  price: { ghs: number; usd?: number } | number;
  originalPrice?: { ghs: number; usd?: number };
  rating: { average: number; count: number };
  stock: { quantity: number; inStock: boolean } | number;
  description: string;
  shortDescription?: string;
  highlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  category: {
    main: string;
    sub?: string;
  };
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const { addItem: addToCart } = useCart();
  const {
    isWishlisted: checkWishlisted,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const isWishlisted = product?._id ? checkWishlisted(product._id) : false;

  const handleAddToCart = async () => {
    if (!product) return;

    const stock =
      typeof product.stock === "object"
        ? product.stock
        : { quantity: product.stock, inStock: product.stock > 0 };

    if (!stock.inStock) {
      return;
    }

    setIsAddingToCart(true);
    try {
      // Get product ID (handle both slug and ObjectId)
      const productIdToUse = product._id || productId;
      await addToCart(productIdToUse, quantity);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    setIsTogglingWishlist(true);
    try {
      // Get product ID (handle both slug and ObjectId)
      const productIdToUse = product._id || productId;
      if (isWishlisted) {
        await removeFromWishlist(productIdToUse);
      } else {
        await addToWishlist(productIdToUse);
      }
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="bg-white rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const price =
    typeof product.price === "object" ? product.price.ghs : product.price;
  const originalPrice = product.originalPrice
    ? typeof product.originalPrice === "object"
      ? product.originalPrice.ghs
      : product.originalPrice
    : undefined;
  const stock =
    typeof product.stock === "object"
      ? product.stock
      : { quantity: product.stock, inStock: product.stock > 0 };
  const images = product.images?.map((img) => img.url) || [];
  const discount = originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg border border-border p-4 sm:p-6 mb-6">
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4">
          {/* Thumbnails */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-hide pb-2 lg:pb-0">
            {images.length > 0 ? (
              images.map((image, index) => (
                <button
                  title={`View image ${index + 1}`}
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative w-16 h-16 lg:w-20 lg:h-20 rounded-lg border-2 overflow-hidden shrink-0 transition-colors",
                    selectedImage === index
                      ? "border-iherb-green"
                      : "border-border hover:border-muted-foreground",
                  )}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`Product view ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))
            ) : (
              <Skeleton className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg" />
            )}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 aspect-square bg-white rounded-lg border border-border overflow-hidden">
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <button
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Brand */}
          {product.brand && (
            <a
              href="#"
              className="text-sm text-iherb-green hover:underline mb-1"
            >
              {product.brand}
            </a>
          )}

          {/* Product Name */}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i < Math.floor(product.rating?.average || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {product.rating?.average?.toFixed(1) || "0.0"}
            </span>
            <a
              href="#reviews"
              className="text-sm text-iherb-green hover:underline"
            >
              {product.rating?.count?.toLocaleString() || 0} Reviews
            </a>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              GH₵{price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-lg text-muted-foreground line-through">
                GH₵{originalPrice.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="destructive">Save {discount}%</Badge>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-4">
            {stock.inStock ? (
              <>
                <Check className="h-5 w-5 text-iherb-green" />
                <span className="text-iherb-green font-medium">In Stock</span>
                <span className="text-muted-foreground">
                  - Ships within 1-2 hours
                </span>
              </>
            ) : (
              <span className="text-red-500 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <span className="text-sm font-medium">Qty:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button
                title="Decrease quantity"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-muted transition-colors min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 sm:w-16 text-center font-medium text-sm sm:text-base">
                {quantity}
              </span>
              <button
                title="Increase quantity"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-muted transition-colors min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !stock.inStock}
              className="flex-1 h-12 sm:h-14 bg-iherb-green hover:bg-iherb-green-dark text-white text-sm sm:text-base font-semibold min-h-[3rem]"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isAddingToCart
                ? "Adding..."
                : !stock.inStock
                  ? "Out of Stock"
                  : "Add to Cart"}
            </Button>
          </div>

          {/* Delivery Info */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Truck className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-muted-foreground">
                  On orders over GH₵1,000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Authenticity Guaranteed</p>
                <p className="text-xs text-muted-foreground">
                  100% genuine products
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RotateCcw className="h-5 w-5 text-iherb-green shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Easy Returns</p>
                <p className="text-xs text-muted-foreground">
                  2 days for Accra, Kumasi, Cape Coast & Takoradi; 3 days for
                  other regions (damaged/faulty items).
                </p>
              </div>
            </div>
          </div>

          {/* Product Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Product Highlights
              </h3>
              <ul className="grid grid-cols-2 gap-2">
                {product.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-iherb-green shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8 pt-8 border-t border-border">
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-3">
            Description
          </h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {product.description ||
              product.shortDescription ||
              "No description available."}
          </p>
        </div>
        {product.specifications && product.specifications.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-3">
              Specifications
            </h3>
            <dl className="space-y-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex">
                  <dt className="w-1/3 text-sm text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="w-2/3 text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
