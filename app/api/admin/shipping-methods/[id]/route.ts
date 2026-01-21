import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { ShippingMethod } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";

const updateShippingMethodSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  deliveryTime: z.string().min(1).optional(),
  multiplier: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  order: z.number().optional(),
});

/**
 * GET /api/admin/shipping-methods/[id] - Get a single shipping method
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid shipping method ID format");
    }

    const shippingMethod = await ShippingMethod.findById(id).lean();

    if (!shippingMethod) {
      throw new NotFoundError("Shipping method");
    }

    logRequest(
      "GET",
      "/api/admin/shipping-methods/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(shippingMethod);
  } catch (error) {
    logger.error("Shipping method fetch failed", error as Error, {
      endpoint: "/api/admin/shipping-methods/[id]",
    });
    logRequest(
      "GET",
      "/api/admin/shipping-methods/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/shipping-methods/[id] - Update a shipping method
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid shipping method ID format");
    }

    const shippingMethod = await ShippingMethod.findById(id);

    if (!shippingMethod) {
      throw new NotFoundError("Shipping method");
    }

    const validatedData = updateShippingMethodSchema.parse(body);

    // Check if code is being changed and if new code exists
    if (validatedData.code && validatedData.code.toLowerCase() !== shippingMethod.code) {
      const codeExists = await ShippingMethod.findOne({
        code: validatedData.code.toLowerCase(),
        _id: { $ne: id },
      });

      if (codeExists) {
        throw new ConflictError("Shipping method with this code already exists");
      }
    }

    // Update fields
    if (validatedData.name) shippingMethod.name = validatedData.name;
    if (validatedData.code) shippingMethod.code = validatedData.code.toLowerCase();
    if (validatedData.description) shippingMethod.description = validatedData.description;
    if (validatedData.deliveryTime) shippingMethod.deliveryTime = validatedData.deliveryTime;
    if (validatedData.multiplier !== undefined) shippingMethod.multiplier = validatedData.multiplier;
    if (validatedData.isActive !== undefined) shippingMethod.isActive = validatedData.isActive;
    if (validatedData.order !== undefined) shippingMethod.order = validatedData.order;

    await shippingMethod.save();

    logRequest(
      "PUT",
      "/api/admin/shipping-methods/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(shippingMethod.toObject());
  } catch (error) {
    logger.error("Shipping method update failed", error as Error, {
      endpoint: "/api/admin/shipping-methods/[id]",
    });
    logRequest(
      "PUT",
      "/api/admin/shipping-methods/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/shipping-methods/[id] - Delete a shipping method
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid shipping method ID format");
    }

    const shippingMethod = await ShippingMethod.findById(id);

    if (!shippingMethod) {
      throw new NotFoundError("Shipping method");
    }

    await shippingMethod.deleteOne();

    logRequest(
      "DELETE",
      "/api/admin/shipping-methods/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({ message: "Shipping method deleted successfully" });
  } catch (error) {
    logger.error("Shipping method deletion failed", error as Error, {
      endpoint: "/api/admin/shipping-methods/[id]",
    });
    logRequest(
      "DELETE",
      "/api/admin/shipping-methods/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
