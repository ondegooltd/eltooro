import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { ShippingMethod } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { logger, logRequest } from "@/lib/logger";

/**
 * GET /api/shipping-methods - Get all active delivery methods
 * Public endpoint for checkout
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();

    const shippingMethods = await ShippingMethod.find({ isActive: true })
      .sort({ order: 1 })
      .lean();

    logRequest("GET", "/api/shipping-methods", 200, Date.now() - startTime);
    return successResponse(shippingMethods);
  } catch (error) {
    logger.error("Delivery methods list failed", error as Error, {
      endpoint: "/api/shipping-methods",
    });
    logRequest(
      "GET",
      "/api/shipping-methods",
      (error as any).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}
