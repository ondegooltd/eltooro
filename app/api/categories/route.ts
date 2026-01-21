import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Category } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { getCache, setCache, cacheKeys, CACHE_TTL } from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    // Check cache for all categories
    if (!parentId || parentId === "null") {
      const cacheKey = cacheKeys.categories.all();
      const cached = await getCache(cacheKey);
      if (cached) {
        logRequest("GET", "/api/categories", 200, Date.now() - startTime);
        return successResponse(cached);
      }
    }

    const query: any = {
      isActive: true,
    };

    if (parentId === null || parentId === "null") {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    const categories = await Category.find(query).sort({ order: 1 }).lean();

    // Cache all categories
    if (!parentId || parentId === "null") {
      await setCache(
        cacheKeys.categories.all(),
        categories,
        CACHE_TTL.CATEGORIES
      );
    }

    logRequest("GET", "/api/categories", 200, Date.now() - startTime);
    return successResponse(categories);
  } catch (error) {
    logger.error("Categories list failed", error as Error, {
      endpoint: "/api/categories",
    });
    logRequest(
      "GET",
      "/api/categories",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
