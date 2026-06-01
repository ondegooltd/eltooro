import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Category } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError, ConflictError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import { deleteCache, cacheKeys } from "@/lib/cache/redis";

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Category slug is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  image: z
    .object({
      url: z.string(),
      publicId: z.string(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { searchParams } = new URL(request.url);

    const parentId = searchParams.get("parentId");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    if (parentId === "null" || parentId === null) {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    logRequest(
      "GET",
      "/api/admin/categories",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(categories);
  } catch (error) {
    logger.error("Categories list failed", error as Error, {
      endpoint: "/api/admin/categories",
    });
    logRequest(
      "GET",
      "/api/admin/categories",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    const validatedData = createCategorySchema.parse(body);

    // Check if slug already exists
    const existingCategory = await Category.findOne({
      slug: validatedData.slug,
    });

    if (existingCategory) {
      throw new ConflictError("Category with this slug already exists");
    }

    const category = new Category({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      parentId: validatedData.parentId || null,
      order: validatedData.order,
      isActive: validatedData.isActive,
      image: validatedData.image,
      productCount: 0,
    });

    await category.save();

    // Invalidate cache
    await deleteCache(cacheKeys.categories.all());

    logRequest(
      "POST",
      "/api/admin/categories",
      201,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(category.toObject(), {}, 201);
  } catch (error) {
    logger.error("Category creation failed", error as Error, {
      endpoint: "/api/admin/categories",
    });
    logRequest(
      "POST",
      "/api/admin/categories",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
