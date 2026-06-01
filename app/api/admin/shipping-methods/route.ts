import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { ShippingMethod } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError, ConflictError } from "@/lib/errors/api-error";
import { z } from "zod";
import { logger, logRequest } from "@/lib/logger";

const shippingMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().min(1, "Description is required"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  multiplier: z.number().min(0, "Multiplier must be 0 or greater"),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

const createShippingMethodSchema = shippingMethodSchema;
const updateShippingMethodSchema = shippingMethodSchema.partial();

/**
 * GET /api/admin/shipping-methods - Get all delivery methods (admin)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const shippingMethods = await ShippingMethod.find(query)
      .sort({ order: 1 })
      .lean();

    logRequest(
      "GET",
      "/api/admin/shipping-methods",
      200,
      Date.now() - startTime,
      session.user.id,
    );
    return successResponse(shippingMethods);
  } catch (error) {
    logger.error("Admin delivery methods list failed", error as Error, {
      endpoint: "/api/admin/shipping-methods",
    });
    logRequest(
      "GET",
      "/api/admin/shipping-methods",
      (error as any).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/shipping-methods - Create a new delivery method
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    const validatedData = createShippingMethodSchema.parse(body);

    // Check if code already exists
    const existing = await ShippingMethod.findOne({
      code: validatedData.code.toLowerCase(),
    });

    if (existing) {
      throw new ConflictError("Delivery method with this code already exists");
    }

    const shippingMethod = new ShippingMethod({
      name: validatedData.name,
      code: validatedData.code.toLowerCase(),
      description: validatedData.description,
      deliveryTime: validatedData.deliveryTime,
      multiplier: validatedData.multiplier,
      isActive:
        validatedData.isActive !== undefined ? validatedData.isActive : true,
      order: validatedData.order || 0,
    });

    await shippingMethod.save();

    logRequest(
      "POST",
      "/api/admin/shipping-methods",
      201,
      Date.now() - startTime,
      session.user.id,
    );
    return successResponse(shippingMethod.toObject(), {}, 201);
  } catch (error) {
    logger.error("Delivery method creation failed", error as Error, {
      endpoint: "/api/admin/shipping-methods",
    });
    logRequest(
      "POST",
      "/api/admin/shipping-methods",
      (error as any).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}
