import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product, Category } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { getCache, setCache, cacheKeys, CACHE_TTL } from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/logger";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");
    const category = searchParams.get("category");

    // Check cache
    const cacheKey = cacheKeys.products.bestSellers(limit, category || "all");
    const cached = await getCache(cacheKey);
    if (cached) {
      logRequest(
        "GET",
        "/api/products/best-sellers",
        200,
        Date.now() - startTime
      );
      return successResponse(cached);
    }

    const query: any = {
      status: "active",
      isBestSeller: true,
    };

    if (category && category !== "all") {
      // Category can be either a slug or ObjectId
      // First try to find category by slug
      const categoryDoc = await Category.findOne({
        slug: category,
        isActive: true,
      }).lean();
      if (categoryDoc) {
        // Use ObjectId for filtering
        query["category.main"] = categoryDoc._id.toString();
      } else if (mongoose.Types.ObjectId.isValid(category)) {
        // If it's a valid ObjectId, use it directly
        query["category.main"] = category;
      } else {
        // If category not found, return empty results
        query["category.main"] = null;
      }
    }

    const products = await Product.find(query)
      .sort({ sales: -1, "rating.average": -1 })
      .limit(limit)
      .lean();

    // Cache result
    await setCache(cacheKey, products, CACHE_TTL.PRODUCTS);

    logRequest(
      "GET",
      "/api/products/best-sellers",
      200,
      Date.now() - startTime
    );
    return successResponse(products);
  } catch (error) {
    logger.error("Best sellers failed", error as Error, {
      endpoint: "/api/products/best-sellers",
    });
    logRequest(
      "GET",
      "/api/products/best-sellers",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
