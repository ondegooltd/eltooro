"use client";

import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  CreditCard,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    apartment?: string;
    city: string;
    region: string;
    postalCode?: string;
    phone: string;
  };
  billing: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    region: string;
    postalCode?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrderDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch order");

      const data = await response.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any)?.accessToken || ""}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order");

      toast({
        title: "Success",
        description: "Order status updated",
      });
      fetchOrder();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading order details...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div>Order not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Link href="/admin/orders">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Button>
              </Link>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">
                    Order {order.orderNumber}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Created on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Status
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <Select
                    value={order.status}
                    onValueChange={updateOrderStatus}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              GHS {(item.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              GHS {item.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>GHS {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>GHS {order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>GHS {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Name</div>
                      <div className="font-medium">
                        {order.shipping.firstName} {order.shipping.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div>{order.shipping.phone}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <div>
                        {order.shipping.firstName} {order.shipping.lastName}
                      </div>
                      <div>{order.shipping.address}</div>
                      {order.shipping.apartment && (
                        <div>{order.shipping.apartment}</div>
                      )}
                      <div>
                        {order.shipping.city}, {order.shipping.region}
                      </div>
                      {order.shipping.postalCode && (
                        <div>{order.shipping.postalCode}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Payment Status
                      </div>
                      <Badge
                        variant={
                          order.paymentStatus === "paid"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Payment Method
                      </div>
                      <div className="capitalize">{order.paymentMethod}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
