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
    const cacheKey = cacheKeys.products.recommended(limit);
    const cached = await getCache(cacheKey);
    if (cached) {
      logRequest(
        "GET",
        "/api/products/recommended",
        200,
        Date.now() - startTime
      );
      return successResponse(cached);
    }

    // Recommended products: high rating, good sales, or best sellers
    const products = await Product.find({
      status: "active",
      $or: [
        { isBestSeller: true },
        { "rating.average": { $gte: 4.5 } },
        { sales: { $gte: 10 } },
      ],
    })
      .sort({ "rating.average": -1, sales: -1, views: -1 })
      .limit(limit)
      .lean();

    // Cache result
    await setCache(cacheKey, products, CACHE_TTL.PRODUCTS);

    logRequest("GET", "/api/products/recommended", 200, Date.now() - startTime);
    return successResponse(products);
  } catch (error) {
    logger.error("Recommended products failed", error as Error, {
      endpoint: "/api/products/recommended",
    });
    logRequest(
      "GET",
      "/api/products/recommended",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
