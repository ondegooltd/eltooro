"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  X,
  Truck,
  Shield,
  Tag,
  ChevronRight,
  ShoppingBag,
  Gift,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

export function CartContent() {
  const {
    items,
    isLoading,
    removeItem,
    updateQuantity,
    itemCount,
    subtotal,
    savings,
  } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [updatingQuantities, setUpdatingQuantities] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    setSelectedItems(items.map((item) => item.productId || item.id));
  }, [items]);

  const shippingThreshold = 1000;
  const freeShippingProgress = Math.min(
    (subtotal / shippingThreshold) * 100,
    100
  );
  const amountToFreeShipping = Math.max(shippingThreshold - subtotal, 0);

  const promoDiscount = promoApplied ? subtotal * 0.1 : 0;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 25;
  const total = subtotal - promoDiscount + shippingCost;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === "save10") {
      setPromoApplied(true);
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item) => item.productId || item.id));
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const itemId = productId;
    setRemovingItems((prev) => new Set(prev).add(itemId));

    try {
      await removeItem(productId);
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const itemId = productId;
    setUpdatingQuantities((prev) => new Set(prev).add(itemId));

    try {
      await updateQuantity(productId, quantity);
    } finally {
      setUpdatingQuantities((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Initial loading state - only show on first load
  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added anything to your cart yet. Start
            shopping to fill it up!
          </p>
          <Button asChild className="bg-iherb-green hover:bg-iherb-green-dark">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-iherb-green">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Shopping Cart</span>
      </nav>

      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
        Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
      </h1>

      {/* Free Shipping Progress */}
      {subtotal < shippingThreshold && (
        <div className="bg-iherb-green/10 border border-iherb-green/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="h-5 w-5 text-iherb-green" />
            <span className="text-sm font-medium">
              Add{" "}
              <span className="text-iherb-green">
                GH₵{amountToFreeShipping.toFixed(2)}
              </span>{" "}
              more to qualify for{" "}
              <span className="text-iherb-green">FREE Shipping!</span>
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-iherb-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select All Header */}
          <div className="bg-white rounded-lg border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedItems.length === items.length}
                onCheckedChange={toggleSelectAll}
                id="select-all"
              />
              <label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({items.length} items)
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Remove Selected
            </Button>
          </div>

          {/* Cart Items List */}
          {items.map((item) => {
            const itemId = item.productId || item.id;
            const isRemoving = removingItems.has(itemId);
            const isUpdating = updatingQuantities.has(itemId);
            const discount = item.originalPrice
              ? Math.round((1 - item.price / item.originalPrice) * 100)
              : 0;

            return (
              <div
                key={item.id}
                className={cn(
                  "bg-white rounded-lg border border-border p-4 transition-all duration-300",
                  isRemoving && "opacity-50 pointer-events-none"
                )}
              >
                {isRemoving ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-iherb-green" />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <Checkbox
                          checked={selectedItems.includes(itemId)}
                          onCheckedChange={() => toggleSelectItem(itemId)}
                        />
                      </div>

                      {/* Product Image */}
                      <Link
                        href={`/product/${item.productId || item.id}`}
                        className="shrink-0"
                      >
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg border border-border overflow-hidden bg-white">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                          />
                          {discount > 0 && (
                            <Badge className="absolute top-1 left-1 bg-red-500 hover:bg-red-500 text-xs">
                              -{discount}%
                            </Badge>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
                          <div className="min-w-0 flex-1">
                            {item.brand && (
                              <Link
                                href={`/product/${item.productId || item.id}`}
                                className="text-sm text-iherb-green hover:underline mb-1 block"
                              >
                                {item.brand}
                              </Link>
                            )}
                            <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                              <Link
                                href={`/product/${item.productId || item.id}`}
                                className="hover:text-iherb-green"
                              >
                                {item.name}
                              </Link>
                            </h3>
                            {item.servingSize && (
                              <p className="text-sm text-muted-foreground">
                                {item.servingSize}
                              </p>
                            )}
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(itemId)}
                            disabled={isRemoving || isUpdating}
                            className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 disabled:opacity-50 min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center sm:self-start"
                            title="Remove item"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mt-4">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-border rounded-lg w-fit">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(itemId, item.quantity - 1)
                              }
                              className="p-2 hover:bg-muted transition-colors disabled:opacity-50 min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center"
                              disabled={
                                item.quantity <= 1 || isUpdating || isRemoving
                              }
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </button>
                            <span className="w-12 sm:w-10 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(itemId, item.quantity + 1)
                              }
                              className="p-2 hover:bg-muted transition-colors disabled:opacity-50 min-w-[2.5rem] min-h-[2.5rem] flex items-center justify-center"
                              disabled={isUpdating || isRemoving}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-base sm:text-lg text-foreground">
                              GH₵{(item.price * item.quantity).toFixed(2)}
                            </div>
                            {item.originalPrice && (
                              <div className="text-xs sm:text-sm text-muted-foreground line-through">
                                GH₵
                                {(item.originalPrice * item.quantity).toFixed(
                                  2
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Delivery Option */}
                    {/* <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-3 p-3 bg-iherb-green/5 rounded-lg">
                        <Clock className="h-5 w-5 text-iherb-green shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            Save 10% with Auto-Delivery
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Schedule regular deliveries and never run out
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-iherb-green border-iherb-green hover:bg-iherb-green/10 bg-transparent"
                        >
                          Set Up
                        </Button>
                      </div>
                    </div> */}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-border p-6 sticky top-24">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Summary
            </h2>

            {/* Promo Code */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1"
                  disabled={promoApplied}
                />
                <Button
                  variant="outline"
                  onClick={handleApplyPromo}
                  disabled={promoApplied || !promoCode}
                  className={cn(
                    promoApplied &&
                      "bg-iherb-green/10 text-iherb-green border-iherb-green"
                  )}
                >
                  {promoApplied ? "Applied" : "Apply"}
                </Button>
              </div>
              {promoApplied && (
                <p className="text-xs text-iherb-green mt-1 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  SAVE10 - 10% off applied!
                </p>
              )}
              {/* <p className="text-xs text-muted-foreground mt-1">
                Try "SAVE10" for 10% off
              </p> */}
            </div>

            {/* Summary Lines */}
            <div className="space-y-3 py-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({itemCount} items)
                </span>
                <span className="font-medium">GH₵{subtotal.toFixed(2)}</span>
              </div>

              {savings > 0 && (
                <div className="flex justify-between text-sm text-iherb-green">
                  <span>Product Savings</span>
                  <span>-GH₵{savings.toFixed(2)}</span>
                </div>
              )}

              {promoApplied && (
                <div className="flex justify-between text-sm text-iherb-green">
                  <span>Promo Discount (10%)</span>
                  <span>-GH₵{promoDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span
                  className={cn(
                    "font-medium",
                    shippingCost === 0 && "text-iherb-green"
                  )}
                >
                  {shippingCost === 0
                    ? "FREE"
                    : `GH₵${shippingCost.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center py-4 border-t border-border">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-foreground">
                GH₵{total.toFixed(2)}
              </span>
            </div>

            {/* Checkout Button */}
            <Button
              asChild
              className="w-full h-12 bg-iherb-green hover:bg-iherb-green-dark text-base font-semibold mb-4"
            >
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            {/* Continue Shopping */}
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/products">Continue Shopping</Link>
            </Button>

            {/* Trust Badges */}
            <div className="mt-6 pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-iherb-green shrink-0" />
                <span className="text-muted-foreground">
                  Secure checkout with SSL encryption
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-iherb-green shrink-0" />
                <span className="text-muted-foreground">
                  Free shipping on orders over GH₵1,000
                </span>
              </div>
              {/* <div className="flex items-center gap-3 text-sm">
                <Gift className="h-5 w-5 text-iherb-green shrink-0" />
                <span className="text-muted-foreground">
                  Free samples with every order
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
