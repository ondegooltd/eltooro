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
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Settings,
  FileText,
  MessageSquare,
  BarChart3,
  FolderTree,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
  totalProducts: number;
  supportTickets: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard/stats");
        const data = await response.json();

        if (data.success) {
          setStats(data.data);
        } else {
          console.error("Failed to fetch stats:", data.message);
          // Fallback to zeros
          setStats({
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 0,
            pendingOrders: 0,
            totalProducts: 0,
            supportTickets: 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Fallback to zeros
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0,
          pendingOrders: 0,
          totalProducts: 0,
          supportTickets: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {(session?.user as any)?.name || "Admin"}
              </p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Loading...
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">---</div>
                      <p className="text-xs text-muted-foreground">---</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Orders
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats?.totalOrders || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All time orders
                    </p>
                  </CardContent>
                </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    GHS {stats?.totalRevenue?.toLocaleString() || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All time revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalUsers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Orders
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats?.pendingOrders || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Products
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active products
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Support Tickets
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.supportTickets || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Open tickets</p>
                </CardContent>
              </Card>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/orders">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-iherb-green" />
                      Manage Orders
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/products">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-5 w-5 text-iherb-green" />
                      Manage Products
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/settings">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="h-5 w-5 text-iherb-green" />
                      Settings
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/sms-templates">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-iherb-green" />
                      SMS Templates
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/info">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5 text-iherb-green" />
                      Content Management
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/support">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-iherb-green" />
                      Support Tickets
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/analytics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-iherb-green" />
                      Analytics
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-5 w-5 text-iherb-green" />
                      Manage Users
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/categories">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FolderTree className="h-5 w-5 text-iherb-green" />
                      Manage Categories
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/shipping-methods">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Truck className="h-5 w-5 text-iherb-green" />
                      Shipping Methods
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
