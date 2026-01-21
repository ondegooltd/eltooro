import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { getCache, setCache, cacheKeys, CACHE_TTL } from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    // Check cache
    const cacheKey = cacheKeys.products.newArrivals(limit);
    const cached = await getCache(cacheKey);
    if (cached) {
      logRequest(
        "GET",
        "/api/products/new-arrivals",
        200,
        Date.now() - startTime
      );
      return successResponse(cached);
    }

    const products = await Product.find({
      status: "active",
      isNewArrival: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Cache result
    await setCache(cacheKey, products, CACHE_TTL.PRODUCTS);

    logRequest(
      "GET",
      "/api/products/new-arrivals",
      200,
      Date.now() - startTime
    );
    return successResponse(products);
  } catch (error) {
    logger.error("New arrivals failed", error as Error, {
      endpoint: "/api/products/new-arrivals",
    });
    logRequest(
      "GET",
      "/api/products/new-arrivals",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
