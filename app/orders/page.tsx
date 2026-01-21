"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, Filter, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = orders.filter(
        (order) =>
          order.orderNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.items?.some((item: any) =>
            item.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        setOrders(data.data || []);
        setFilteredOrders(data.data || []);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 150);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-purple-100 text-purple-800";
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
            className={`container mx-auto px-4 py-6 sm:py-8 transition-opacity duration-500 ease-in-out ${
              showContent && !isLoading ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Account
                </Button>
              </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track and manage your orders
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-9 w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border rounded-lg overflow-hidden"
                  >
                    <div className="p-4 border-b bg-muted/50">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="p-4">
                      <Skeleton className="h-20 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id || order.orderNumber}
                    className="bg-card border rounded-lg overflow-hidden"
                  >
                    <div className="p-3 sm:p-4 border-b bg-muted/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Order Number
                          </p>
                          <p className="text-sm sm:text-base font-semibold">
                            {order.orderNumber || order._id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Date Placed
                          </p>
                          <p className="text-sm sm:text-base font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Total
                          </p>
                          <p className="text-sm sm:text-base font-semibold">
                            {order.pricing?.currency || "GHS"}{" "}
                            {order.pricing?.total?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          order.status
                        )} text-xs sm:text-sm`}
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                        {order.items?.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 sm:gap-3"
                          >
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded border overflow-hidden shrink-0">
                              <Image
                                src={
                                  item.image?.url ||
                                  item.product?.image ||
                                  item.image ||
                                  "/placeholder.svg"
                                }
                                alt={
                                  item.name || item.product?.name || "Product"
                                }
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate">
                                {item.name || item.product?.name || "Product"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity || item.qty || 1}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <Link
                          href={`/orders/${order._id || order.orderNumber}`}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {searchQuery ? "No orders found" : "No orders yet"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start shopping to see your orders here"}
                </p>
                {!searchQuery && (
                  <Link href="/products">
                    <Button className="bg-iherb-green hover:bg-iherb-green-dark">
                      Browse Products
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
