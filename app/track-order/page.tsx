"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function TrackOrderPage() {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order number",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim() && !phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter either email or phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTracking(true);
      setError(null);
      setTrackingData(null);

      const params = new URLSearchParams();
      params.set("orderNumber", orderNumber.trim());
      if (email.trim()) params.set("email", email.trim());
      if (phone.trim()) params.set("phone", phone.trim());

      const response = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTrackingData(data.data);
      } else {
        setError(data.message || "Order not found");
        toast({
          title: "Error",
          description: data.message || "Order not found",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to track order:", error);
      setError("Failed to track order. Please try again.");
      toast({
        title: "Error",
        description: "Failed to track order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTracking(false);
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-iherb-green text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 text-center">
            <Truck className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Track Your Order
            </h1>
            <p className="text-base sm:text-xl text-white/90 max-w-2xl mx-auto">
              Enter your order details to see the current status of your
              shipment
            </p>
          </div>
        </section>

        {/* Track Form */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <div className="bg-card border rounded-xl p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                  Enter Order Information
                </h2>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="e.g., ORD-12345678"
                      className="mt-1"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email used for the order"
                      className="mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number (Alternative)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number used for the order"
                      className="mt-1"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-iherb-green hover:bg-iherb-green-dark"
                    disabled={isTracking}
                  >
                    {isTracking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Track Order
                      </>
                    )}
                  </Button>
                </form>
                <p className="text-xs sm:text-sm text-muted-foreground mt-4 text-center">
                  Or{" "}
                  <Link
                    href="/login"
                    className="text-iherb-green hover:underline"
                  >
                    sign in
                  </Link>{" "}
                  to view all your orders
                </p>
              </div>

              {/* Tracking Results */}
              {trackingData && (
                <div className="bg-card border rounded-xl p-6 sm:p-8 mt-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">
                    Order Tracking Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Order Number:
                      </span>
                      <span className="font-semibold">
                        {trackingData.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge className={getStatusColor(trackingData.status)}>
                        {trackingData.status}
                      </Badge>
                    </div>
                    {trackingData.trackingNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Tracking Number:
                        </span>
                        <span className="font-mono text-sm">
                          {trackingData.trackingNumber}
                        </span>
                      </div>
                    )}
                    {trackingData.estimatedDelivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Estimated Delivery:
                        </span>
                        <span className="text-sm">
                          {new Date(
                            trackingData.estimatedDelivery
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {trackingData.statusHistory &&
                      trackingData.statusHistory.length > 0 && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="font-semibold mb-3 text-sm sm:text-base">
                            Status History
                          </h4>
                          <div className="space-y-3">
                            {trackingData.statusHistory.map(
                              (history: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3"
                                >
                                  <div className="w-2 h-2 rounded-full bg-iherb-green mt-2 shrink-0" />
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {history.status}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        history.timestamp
                                      ).toLocaleString()}
                                    </p>
                                    {history.note && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {history.note}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {error && !trackingData && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Order Status Example */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              Order Status Guide
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                {[
                  {
                    icon: Clock,
                    title: "Processing",
                    description: "Order confirmed and being prepared",
                  },
                  {
                    icon: Package,
                    title: "Shipped",
                    description: "Package is on its way",
                  },
                  {
                    icon: Truck,
                    title: "In Transit",
                    description: "With carrier for delivery",
                  },
                  {
                    icon: CheckCircle,
                    title: "Delivered",
                    description: "Package has arrived",
                  },
                ].map((status, index) => (
                  <div key={status.title} className="flex-1 relative">
                    <div className="bg-card border rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-iherb-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <status.icon className="h-6 w-6 text-iherb-green" />
                      </div>
                      <h3 className="font-semibold mb-1">{status.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                    {index < 3 && (
                      <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-0.5 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              If you have questions about your order, our customer service team
              is here to help.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="/help">Visit Help Center</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
