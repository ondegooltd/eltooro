import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await initModels();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Build query
    const query: any = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "name.first": { $regex: search, $options: "i" } },
        { "name.last": { $regex: search, $options: "i" } },
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get users with pagination
    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse(
      users,
      {
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
