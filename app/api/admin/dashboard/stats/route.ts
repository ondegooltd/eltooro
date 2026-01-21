import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, User, Product, SupportTicket } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await initModels();

    // Get all stats in parallel
    const [
      totalOrders,
      totalUsers,
      pendingOrders,
      totalProducts,
      supportTickets,
      revenueData,
    ] = await Promise.all([
      // Total orders count
      Order.countDocuments(),
      // Total users count
      User.countDocuments(),
      // Pending orders count
      Order.countDocuments({ status: { $in: ["pending", "confirmed"] } }),
      // Total active products count
      Product.countDocuments({ status: "active" }),
      // Open support tickets count
      SupportTicket.countDocuments({
        status: { $in: ["open", "in_progress"] },
      }),
      // Total revenue from delivered orders
      Order.aggregate([
        {
          $match: {
            status: "delivered",
            "pricing.total": { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.total" },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueData.length > 0 && revenueData[0].total
        ? revenueData[0].total
        : 0;

    return successResponse({
      totalOrders,
      totalRevenue,
      totalUsers,
      pendingOrders,
      totalProducts,
      supportTickets,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
