"use client";

import { useSession } from "next-auth/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AnalyticsData {
  revenue: {
    total: number;
    change: number;
    period: string;
  };
  orders: {
    total: number;
    change: number;
    period: string;
  };
  users: {
    total: number;
    change: number;
    period: string;
  };
  products: {
    total: number;
    change: number;
    period: string;
  };
  charts?: {
    revenueTrends: Array<{ date: string; revenue: number }>;
    orderTrends: Array<{ date: string; orders: number }>;
    userTrends: Array<{ date: string; users: number }>;
    topProducts: Array<{ name: string; revenue: number; quantity: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
  };
}

const COLORS = {
  revenue: "hsl(var(--chart-1))",
  orders: "hsl(var(--chart-2))",
  users: "hsl(var(--chart-3))",
  products: "hsl(var(--chart-4))",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
  refunded: "#6b7280",
};

export default function AdminAnalyticsPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<string>("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        console.error("Failed to fetch analytics:", data.message);
        setAnalytics(null);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    // Handle YYYY-MM-DD or YYYY-MM format
    if (period === "year") {
      // Format: YYYY-MM
      const [year, month] = dateString.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }
    // Format: YYYY-MM-DD
    const [year, month, day] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const revenueConfig = {
    revenue: {
      label: "Revenue",
      color: COLORS.revenue,
    },
  };

  const orderConfig = {
    orders: {
      label: "Orders",
      color: COLORS.orders,
    },
  };

  const userConfig = {
    users: {
      label: "Users",
      color: COLORS.users,
    },
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-muted">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                  View business insights and metrics
                </p>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        GHS {analytics.revenue.total.toLocaleString() || "0.00"}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {analytics.revenue.change !== undefined && (
                          <>
                            {analytics.revenue.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            {Math.abs(analytics.revenue.change).toFixed(1)}%
                            from last period
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Orders
                      </CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.orders.total || 0}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {analytics.orders.change !== undefined && (
                          <>
                            {analytics.orders.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            {Math.abs(analytics.orders.change).toFixed(1)}% from
                            last period
                          </>
                        )}
                      </div>
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
                        {analytics.users.total || 0}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {analytics.users.change !== undefined && (
                          <>
                            {analytics.users.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            {Math.abs(analytics.users.change).toFixed(1)}% from
                            last period
                          </>
                        )}
                      </div>
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
                        {analytics.products.total || 0}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {analytics.products.change !== undefined && (
                          <>
                            {analytics.products.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                            )}
                            {Math.abs(analytics.products.change).toFixed(1)}%
                            from last period
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                {analytics.charts && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                        <CardDescription>
                          Revenue over{" "}
                          {period === "week"
                            ? "the week"
                            : period === "month"
                            ? "the month"
                            : "the year"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={revenueConfig}
                          className="h-[300px]"
                        >
                          <LineChart data={analytics.charts.revenueTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={formatDate}
                              style={{ fontSize: "12px" }}
                            />
                            <YAxis style={{ fontSize: "12px" }} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => [
                                    `GHS ${Number(value).toLocaleString()}`,
                                    "Revenue",
                                  ]}
                                />
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="revenue"
                              stroke={COLORS.revenue}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Order Trends */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Trends</CardTitle>
                        <CardDescription>
                          Orders over{" "}
                          {period === "week"
                            ? "the week"
                            : period === "month"
                            ? "the month"
                            : "the year"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={orderConfig}
                          className="h-[300px]"
                        >
                          <LineChart data={analytics.charts.orderTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={formatDate}
                              style={{ fontSize: "12px" }}
                            />
                            <YAxis style={{ fontSize: "12px" }} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => [
                                    Number(value).toLocaleString(),
                                    "Orders",
                                  ]}
                                />
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="orders"
                              stroke={COLORS.orders}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* User Growth */}
                    <Card>
                      <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>
                          New users over{" "}
                          {period === "week"
                            ? "the week"
                            : period === "month"
                            ? "the month"
                            : "the year"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={userConfig}
                          className="h-[300px]"
                        >
                          <LineChart data={analytics.charts.userTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={formatDate}
                              style={{ fontSize: "12px" }}
                            />
                            <YAxis style={{ fontSize: "12px" }} />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => [
                                    Number(value).toLocaleString(),
                                    "Users",
                                  ]}
                                />
                              }
                            />
                            <Line
                              type="monotone"
                              dataKey="users"
                              stroke={COLORS.users}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Products by Revenue</CardTitle>
                        <CardDescription>
                          Best performing products
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            revenue: {
                              label: "Revenue",
                              color: COLORS.revenue,
                            },
                          }}
                          className="h-[300px]"
                        >
                          <BarChart
                            data={analytics.charts.topProducts.slice(0, 10)}
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" style={{ fontSize: "12px" }} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={120}
                              style={{ fontSize: "12px" }}
                            />
                            <ChartTooltip
                              content={
                                <ChartTooltipContent
                                  formatter={(value) => [
                                    `GHS ${Number(value).toLocaleString()}`,
                                    "Revenue",
                                  ]}
                                />
                              }
                            />
                            <Bar
                              dataKey="revenue"
                              fill={COLORS.revenue}
                              radius={[0, 4, 4, 0]}
                            />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>

                    {/* Orders by Status */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Orders by Status</CardTitle>
                        <CardDescription>
                          Distribution of orders by status
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ChartContainer config={{}} className="h-[300px]">
                            <PieChart>
                              <Pie
                                data={analytics.charts.ordersByStatus}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ status, percent }) =>
                                  `${status}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="count"
                              >
                                {analytics.charts.ordersByStatus.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={
                                        STATUS_COLORS[entry.status] || "#8884d8"
                                      }
                                    />
                                  )
                                )}
                              </Pie>
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    formatter={(value) => [
                                      Number(value).toLocaleString(),
                                      "Orders",
                                    ]}
                                  />
                                }
                              />
                            </PieChart>
                          </ChartContainer>
                          <div className="flex flex-col justify-center gap-2">
                            {analytics.charts.ordersByStatus.map((item) => (
                              <div
                                key={item.status}
                                className="flex items-center justify-between p-2 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{
                                      backgroundColor:
                                        STATUS_COLORS[item.status] || "#8884d8",
                                    }}
                                  />
                                  <span className="capitalize text-sm">
                                    {item.status}
                                  </span>
                                </div>
                                <span className="font-semibold">
                                  {item.count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No analytics data available
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
