"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);

      // Check if orderId is a valid ObjectId (24 hex characters)
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId || "");

      if (isObjectId) {
        // Try to fetch order by ID
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          const data = await response.json();
          if (data.success) {
            setOrder(data.data);
            return;
          }
        } catch (error) {
          console.error("Failed to fetch order by ID:", error);
        }
      }

      // Fallback: fetch all orders and find by orderNumber
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success && data.data) {
        // Find order by orderNumber or _id
        const foundOrder = data.data.find(
          (o: any) =>
            o.orderNumber === orderId ||
            o._id === orderId ||
            o._id?.toString() === orderId
        );
        if (foundOrder) {
          setOrder(foundOrder);
        }
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin text-iherb-green mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  const orderNumber =
    order?.orderNumber || orderId || `ORD${Date.now().toString().slice(-8)}`;
  const estimatedDelivery = order?.shipping?.estimatedDelivery
    ? new Date(order.shipping.estimatedDelivery).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "en-US",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
        }
      );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-iherb-green" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-muted-foreground mb-8">
          {order?.payment?.status === "completed"
            ? "Your payment has been confirmed and your order has been placed successfully. We've sent a confirmation email with your order details."
            : "Your order has been placed successfully. We've sent a confirmation email with your order details."}
        </p>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg border border-border p-6 mb-8 text-left">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Number</p>
              <p className="font-bold text-lg text-foreground">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Estimated Delivery
              </p>
              <p className="font-bold text-lg text-foreground">
                {estimatedDelivery}
              </p>
            </div>
            {order?.pricing && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="font-bold text-lg text-foreground">
                    {order.pricing.currency || "GHS"}{" "}
                    {order.pricing.total?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <p className="font-bold text-lg text-foreground capitalize">
                    {order.payment?.status === "completed"
                      ? "Paid"
                      : order.payment?.status || "Pending"}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg border border-border p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-6 text-left">
            Order Status
          </h2>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-8 right-8 h-0.5 bg-border" />
            <div
              className={cn(
                "absolute top-5 left-8 h-0.5 bg-iherb-green transition-all duration-300",
                order?.status === "confirmed"
                  ? "w-[30%]"
                  : order?.status === "processing"
                  ? "w-[60%]"
                  : order?.status === "shipped"
                  ? "w-[90%]"
                  : order?.status === "delivered"
                  ? "w-full"
                  : "w-[15%]"
              )}
            />

            {/* Steps */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  order?.status === "pending" ||
                    order?.status === "confirmed" ||
                    order?.status === "processing" ||
                    order?.status === "shipped" ||
                    order?.status === "delivered"
                    ? "bg-iherb-green"
                    : "bg-muted border-2 border-border"
                )}
              >
                <CheckCircle
                  className={cn(
                    "h-5 w-5",
                    order?.status === "pending" ||
                      order?.status === "confirmed" ||
                      order?.status === "processing" ||
                      order?.status === "shipped" ||
                      order?.status === "delivered"
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-xs font-medium mt-2">Confirmed</p>
            </div>

            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  order?.status === "processing" ||
                    order?.status === "shipped" ||
                    order?.status === "delivered"
                    ? "bg-iherb-green"
                    : "bg-muted border-2 border-border"
                )}
              >
                <Package
                  className={cn(
                    "h-5 w-5",
                    order?.status === "processing" ||
                      order?.status === "shipped" ||
                      order?.status === "delivered"
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Processing</p>
            </div>

            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  order?.status === "shipped" || order?.status === "delivered"
                    ? "bg-iherb-green"
                    : "bg-muted border-2 border-border"
                )}
              >
                <Truck
                  className={cn(
                    "h-5 w-5",
                    order?.status === "shipped" || order?.status === "delivered"
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Shipped</p>
            </div>

            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center z-10",
                  order?.status === "delivered"
                    ? "bg-iherb-green"
                    : "bg-muted border-2 border-border"
                )}
              >
                <CheckCircle
                  className={cn(
                    "h-5 w-5",
                    order?.status === "delivered"
                      ? "text-white"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Delivered</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <Link href={`/track-order?orderNumber=${orderNumber}`}>
              <Package className="h-4 w-4" />
              Track Order
            </Link>
          </Button>
          {order?._id && (
            <Button asChild variant="outline" className="gap-2 bg-transparent">
              <Link href={`/orders/${order._id}`}>
                <Download className="h-4 w-4" />
                View Order Details
              </Link>
            </Button>
          )}
        </div>

        {/* Continue Shopping */}
        <Button
          asChild
          className="bg-iherb-green hover:bg-iherb-green-dark gap-2"
        >
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        {/* Help Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="font-semibold text-foreground mb-4">Need Help?</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <Link
              href="/help"
              className="text-iherb-green hover:underline flex items-center justify-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
            <Link href="/returns" className="text-iherb-green hover:underline">
              Return Policy
            </Link>
            <Link href="/shipping" className="text-iherb-green hover:underline">
              Shipping Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
