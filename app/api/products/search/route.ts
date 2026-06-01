import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { logger, logRequest } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!q || q.trim().length === 0) {
      throw new ValidationError("Search query is required");
    }

    await initModels();
    const skip = (page - 1) * limit;

    // Use MongoDB text search
    const query = {
      $text: { $search: q },
      status: "active",
    };

    const [data, total] = await Promise.all([
      Product.find(query)
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const response = successResponse(data, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    logRequest("GET", "/api/products/search", 200, Date.now() - startTime);
    return response;
  } catch (error) {
    logger.error("Product search failed", error as Error, {
      endpoint: "/api/products/search",
    });
    logRequest(
      "GET",
      "/api/products/search",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
