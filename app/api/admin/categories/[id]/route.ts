import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Category, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import { deleteCache, cacheKeys } from "@/lib/cache/redis";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  image: z
    .object({
      url: z.string(),
      publicId: z.string(),
    })
    .optional(),
});

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
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      throw new NotFoundError("Category");
    }

    // Get subcategories
    const subcategories = await Category.find({
      parentId: id,
    })
      .sort({ order: 1 })
      .lean();

    logRequest(
      "GET",
      "/api/admin/categories/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({
      ...category,
      subcategories,
    });
  } catch (error) {
    logger.error("Category fetch failed", error as Error, {
      endpoint: "/api/admin/categories/[id]",
    });
    logRequest(
      "GET",
      "/api/admin/categories/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

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
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(id);

    if (!category) {
      throw new NotFoundError("Category");
    }

    const validatedData = updateCategorySchema.parse(body);

    // Check if slug is being changed and if new slug exists
    if (validatedData.slug && validatedData.slug !== category.slug) {
      const slugExists = await Category.findOne({
        slug: validatedData.slug,
        _id: { $ne: id },
      });

      if (slugExists) {
        throw new ConflictError("Category with this slug already exists");
      }
    }

    // Prevent setting parent to itself
    if (validatedData.parentId === id) {
      throw new ValidationError("Category cannot be its own parent");
    }

    // Update category fields
    if (validatedData.name) category.name = validatedData.name;
    if (validatedData.slug) category.slug = validatedData.slug;
    if (validatedData.description !== undefined)
      category.description = validatedData.description;
    if (validatedData.parentId !== undefined)
      category.parentId = validatedData.parentId || null;
    if (validatedData.order !== undefined) category.order = validatedData.order;
    if (validatedData.isActive !== undefined)
      category.isActive = validatedData.isActive;
    if (validatedData.image !== undefined) category.image = validatedData.image;

    await category.save();

    // Invalidate cache
    await deleteCache(cacheKeys.categories.all());
    if (category.slug) {
      await deleteCache(cacheKeys.categories.detail(category.slug));
    }
    if (validatedData.slug) {
      await deleteCache(cacheKeys.categories.detail(validatedData.slug));
    }

    logRequest(
      "PUT",
      "/api/admin/categories/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(category.toObject());
  } catch (error) {
    logger.error("Category update failed", error as Error, {
      endpoint: "/api/admin/categories/[id]",
    });
    logRequest(
      "PUT",
      "/api/admin/categories/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

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
      throw new ValidationError("Invalid category ID format");
    }

    const category = await Category.findById(id);

    if (!category) {
      throw new NotFoundError("Category");
    }

    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentId: id });

    if (subcategoriesCount > 0) {
      throw new ValidationError(
        "Cannot delete category with subcategories. Please delete or move subcategories first."
      );
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({
      "category.main": id,
    });

    if (productsCount > 0) {
      throw new ValidationError(
        "Cannot delete category with products. Please remove or reassign products first."
      );
    }

    await Category.findByIdAndDelete(id);

    // Invalidate cache
    await deleteCache(cacheKeys.categories.all());
    await deleteCache(cacheKeys.categories.detail(category.slug));

    logRequest(
      "DELETE",
      "/api/admin/categories/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({ message: "Category deleted successfully" });
  } catch (error) {
    logger.error("Category deletion failed", error as Error, {
      endpoint: "/api/admin/categories/[id]",
    });
    logRequest(
      "DELETE",
      "/api/admin/categories/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
