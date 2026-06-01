"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Loader2,
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (session && params.id) {
      fetchOrder();
    }
  }, [session, params.id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load order",
          variant: "destructive",
        });
        router.push("/orders");
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast({
        title: "Error",
        description: "Failed to load order",
        variant: "destructive",
      });
      router.push("/orders");
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 150);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300">
              <Loader2 className="h-8 w-8 animate-spin text-iherb-green" />
            </div>
          )}

          {/* Content with smooth fade-in */}
          <div
            className={`container mx-auto px-4 py-8 transition-opacity duration-500 ease-in-out ${
              showContent && !isLoading ? "opacity-100" : "opacity-0"
            }`}
          >
            {!order && !isLoading ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Order not found</h3>
                <p className="text-muted-foreground mb-4">
                  The order you're looking for doesn't exist or you don't have
                  access to it.
                </p>
                <Link href="/orders">
                  <Button>Back to Orders</Button>
                </Link>
              </div>
            ) : order ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <Link href="/orders">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Orders
                    </Button>
                  </Link>
                </div>

                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-2">
                    <h1 className="text-2xl sm:text-3xl font-bold">
                      Order Details
                    </h1>
                    <Badge
                      className={`${getStatusColor(
                        order.status,
                      )} text-xs sm:text-sm`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Order #{order.orderNumber}
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Order Items */}
                    <div className="bg-card border rounded-lg p-4 sm:p-6">
                      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                        Order Items
                      </h2>
                      <div className="space-y-3 sm:space-y-4">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex gap-3 sm:gap-4">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded border overflow-hidden shrink-0">
                              <Image
                                src={
                                  item.product?.image?.url ||
                                  item.image?.url ||
                                  item.image ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  item.product?.name || item.name || "Product"
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm sm:text-base">
                                {item.product?.name || item.name}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                SKU: {item.product?.sku || item.sku || "N/A"}
                              </p>
                              <p className="text-xs sm:text-sm mt-1">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-semibold text-sm sm:text-base">
                                {order.pricing?.currency || "GHS"}{" "}
                                {(
                                  (item.product?.price?.selling ||
                                    item.price?.selling ||
                                    0) * item.quantity
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    {order.shipping && (
                      <div className="bg-card border rounded-lg p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-iherb-green" />
                          <h2 className="font-semibold text-base sm:text-lg">
                            Delivery Information
                          </h2>
                        </div>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {order.shipping.firstName} {order.shipping.lastName}
                          </p>
                          <p>
                            <span className="font-medium">Address:</span>{" "}
                            {order.shipping.address}
                            {order.shipping.apartment &&
                              `, ${order.shipping.apartment}`}
                          </p>
                          <p>
                            <span className="font-medium">City:</span>{" "}
                            {order.shipping.city}
                          </p>
                          <p>
                            <span className="font-medium">Region:</span>{" "}
                            {order.shipping.region}
                          </p>
                          {order.shipping.postalCode && (
                            <p>
                              <span className="font-medium">Postal Code:</span>{" "}
                              {order.shipping.postalCode}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Phone:</span>{" "}
                            {order.shipping.phone}
                          </p>
                          {order.trackingNumber && (
                            <p>
                              <span className="font-medium">
                                Tracking Number:
                              </span>{" "}
                              <span className="font-mono">
                                {order.trackingNumber}
                              </span>
                            </p>
                          )}
                          {order.shipping.estimatedDelivery && (
                            <p>
                              <span className="font-medium">
                                Estimated Delivery:
                              </span>{" "}
                              {new Date(
                                order.shipping.estimatedDelivery,
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4 sm:space-y-6">
                    {/* Order Summary */}
                    <div className="bg-card border rounded-lg p-4 sm:p-6">
                      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                        Order Summary
                      </h2>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Subtotal</span>
                          <span>
                            {order.pricing?.currency || "GHS"}{" "}
                            {order.pricing?.subtotal?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                        {order.pricing?.delivery && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span>Delivery</span>
                            <span>
                              {order.pricing?.currency || "GHS"}{" "}
                              {order.pricing.delivery.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {order.pricing?.discount && (
                          <div className="flex justify-between text-xs sm:text-sm text-green-600">
                            <span>Discount</span>
                            <span>
                              -{order.pricing?.currency || "GHS"}{" "}
                              {order.pricing.discount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold text-sm sm:text-base">
                          <span>Total</span>
                          <span>
                            {order.pricing?.currency || "GHS"}{" "}
                            {order.pricing?.total?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div className="bg-card border rounded-lg p-4 sm:p-6">
                      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                        Order Information
                      </h2>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Order Date
                            </p>
                            <p className="text-xs sm:text-sm font-medium">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {order.payment && (
                          <div className="flex items-start gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Payment Method
                              </p>
                              <p className="text-xs sm:text-sm font-medium capitalize">
                                {order.payment.method || "N/A"}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                Status:{" "}
                                <span className="capitalize">
                                  {order.payment.status || "N/A"}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-card border rounded-lg p-4 sm:p-6">
                      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                        Actions
                      </h2>
                      <div className="space-y-2">
                        {order.trackingNumber && (
                          <Link
                            href={`/track-order?orderNumber=${order.orderNumber}`}
                          >
                            <Button variant="outline" className="w-full">
                              <Truck className="h-4 w-4 mr-2" />
                              Track Order
                            </Button>
                          </Link>
                        )}
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            className="w-full text-red-600"
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Are you sure you want to cancel this order?",
                                )
                              ) {
                                return;
                              }
                              try {
                                const response = await fetch(
                                  `/api/orders/${order._id}/cancel`,
                                  {
                                    method: "POST",
                                  },
                                );
                                const data = await response.json();
                                if (data.success) {
                                  toast({
                                    title: "Success",
                                    description: "Order cancelled successfully",
                                  });
                                  fetchOrder();
                                } else {
                                  toast({
                                    title: "Error",
                                    description:
                                      data.message || "Failed to cancel order",
                                    variant: "destructive",
                                  });
                                }
                              } catch (error) {
                                console.error("Failed to cancel order:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to cancel order",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
