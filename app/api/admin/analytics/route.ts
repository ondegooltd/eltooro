import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, User, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await initModels();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month"; // month, week, year

    // Calculate date ranges
    const now = new Date();
    let currentPeriodStart: Date;
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    switch (period) {
      case "week":
        currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - 7);
        previousPeriodStart = new Date(currentPeriodStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        previousPeriodEnd = new Date(currentPeriodStart);
        break;
      case "year":
        currentPeriodStart = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
        previousPeriodEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      default: // month
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        previousPeriodEnd = new Date(
          now.getFullYear(),
          now.getMonth(),
          0,
          23,
          59,
          59
        );
    }

    // Get current period stats
    const [
      currentRevenue,
      currentOrders,
      currentUsers,
      currentProducts,
      previousRevenue,
      previousOrders,
      previousUsers,
      previousProducts,
    ] = await Promise.all([
      // Current period revenue
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            "pricing.total": { $exists: true },
            createdAt: { $gte: currentPeriodStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.total" },
          },
        },
      ]),
      // Current period orders
      Order.countDocuments({
        createdAt: { $gte: currentPeriodStart },
      }),
      // Current period users
      User.countDocuments({
        createdAt: { $gte: currentPeriodStart },
      }),
      // Current period products
      Product.countDocuments({
        status: "active",
        createdAt: { $gte: currentPeriodStart },
      }),
      // Previous period revenue
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            "pricing.total": { $exists: true },
            createdAt: {
              $gte: previousPeriodStart,
              $lte: previousPeriodEnd,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.total" },
          },
        },
      ]),
      // Previous period orders
      Order.countDocuments({
        createdAt: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
      // Previous period users
      User.countDocuments({
        createdAt: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
      // Previous period products
      Product.countDocuments({
        status: "active",
        createdAt: {
          $gte: previousPeriodStart,
          $lte: previousPeriodEnd,
        },
      }),
    ]);

    const currentRevenueTotal =
      currentRevenue.length > 0 && currentRevenue[0].total
        ? currentRevenue[0].total
        : 0;
    const previousRevenueTotal =
      previousRevenue.length > 0 && previousRevenue[0].total
        ? previousRevenue[0].total
        : 0;

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueChange = calculateChange(
      currentRevenueTotal,
      previousRevenueTotal
    );
    const ordersChange = calculateChange(currentOrders, previousOrders);
    const usersChange = calculateChange(currentUsers, previousUsers);
    const productsChange = calculateChange(currentProducts, previousProducts);

    // Determine period label
    let periodLabel = "This month";
    if (period === "week") {
      periodLabel = "This week";
    } else if (period === "year") {
      periodLabel = "This year";
    }

    // Get time-series data for charts
    let revenueTrends: Array<{ date: string; revenue: number }> = [];
    let orderTrends: Array<{ date: string; orders: number }> = [];
    let userTrends: Array<{ date: string; users: number }> = [];

    // Determine grouping format based on period
    let dateFormat: string;
    let dateGroupFormat: any;
    if (period === "week") {
      dateFormat = "%Y-%m-%d";
      dateGroupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    } else if (period === "year") {
      dateFormat = "%Y-%m";
      dateGroupFormat = {
        $dateToString: { format: "%Y-%m", date: "$createdAt" },
      };
    } else {
      dateFormat = "%Y-%m-%d";
      dateGroupFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };
    }

    // Revenue trends
    const revenueTrendsData = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          "pricing.total": { $exists: true },
          createdAt: { $gte: currentPeriodStart },
        },
      },
      {
        $group: {
          _id: dateGroupFormat,
          revenue: { $sum: "$pricing.total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    revenueTrends = revenueTrendsData.map((item) => ({
      date: item._id,
      revenue: item.revenue || 0,
    }));

    // Order trends
    const orderTrendsData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentPeriodStart },
        },
      },
      {
        $group: {
          _id: dateGroupFormat,
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    orderTrends = orderTrendsData.map((item) => ({
      date: item._id,
      orders: item.orders || 0,
    }));

    // User trends
    const userTrendsData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: currentPeriodStart },
        },
      },
      {
        $group: {
          _id: dateGroupFormat,
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    userTrends = userTrendsData.map((item) => ({
      date: item._id,
      users: item.users || 0,
    }));

    // Top products by revenue
    const topProducts = await Order.aggregate([
      {
        $match: {
          status: "delivered",
          createdAt: { $gte: currentPeriodStart },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          revenue: { $sum: "$items.subtotal" },
          quantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentPeriodStart },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return successResponse({
      revenue: {
        total: currentRevenueTotal,
        change: Math.round(revenueChange * 100) / 100,
        period: periodLabel,
      },
      orders: {
        total: currentOrders,
        change: Math.round(ordersChange * 100) / 100,
        period: periodLabel,
      },
      users: {
        total: currentUsers,
        change: Math.round(usersChange * 100) / 100,
        period: periodLabel,
      },
      products: {
        total: currentProducts,
        change: Math.round(productsChange * 100) / 100,
        period: periodLabel,
      },
      charts: {
        revenueTrends,
        orderTrends,
        userTrends,
        topProducts: topProducts.map((p) => ({
          name: p.name || "Unknown",
          revenue: p.revenue || 0,
          quantity: p.quantity || 0,
        })),
        ordersByStatus: ordersByStatus.map((s) => ({
          status: s._id,
          count: s.count || 0,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
