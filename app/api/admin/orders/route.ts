import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";

/**
 * GET /api/admin/orders
 * List all orders (admin only). Does not filter by userId, so admins see every order.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await initModels();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shipping.firstName": { $regex: search, $options: "i" } },
        { "shipping.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return successResponse(orders, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
