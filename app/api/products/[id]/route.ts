import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { requireAdmin } from "@/lib/api/middleware";
import mongoose from "mongoose";
import {
  getCache,
  setCache,
  deleteCache,
  cacheKeys,
  CACHE_TTL,
} from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/logger";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    await initModels();
    const { id } = await params;

    // Check if user is admin (for viewing inactive/draft products)
    let isAdmin = false;
    try {
      await requireAdmin(request);
      isAdmin = true;
    } catch {
      // Not admin, continue with public access
    }

    // Build query - support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query: any = isObjectId ? { _id: id } : { slug: id };
    if (!isAdmin) {
      query.status = "active";
    }

    // Check cache (only for active products and ObjectId)
    if (!isAdmin && isObjectId) {
      const cacheKey = cacheKeys.products.detail(id);
      const cached = await getCache(cacheKey);
      if (cached) {
        // Still increment views but don't wait
        Product.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch((err) =>
          logger.error("Failed to increment views", err)
        );

        logRequest("GET", "/api/products/[id]", 200, Date.now() - startTime);
        return successResponse(cached);
      }
    }

    const product = await Product.findOne(query).lean();

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Cache product (only for active products and ObjectId)
    if (!isAdmin && product.status === "active" && isObjectId) {
      const cacheKey = cacheKeys.products.detail(id);
      await setCache(cacheKey, product, CACHE_TTL.PRODUCTS);
    }

    // Increment views (only for active products viewed by non-admins)
    if (!isAdmin && product.status === "active") {
      await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });
    }

    logRequest("GET", "/api/products/[id]", 200, Date.now() - startTime);
    return successResponse(product);
  } catch (error) {
    logger.error("Product detail failed", error as Error, {
      endpoint: "/api/products/[id]",
    });
    logRequest(
      "GET",
      "/api/products/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  costPrice: z.number().optional(),
  price: z
    .union([
      z.number(),
      z.object({
        ghs: z.number(),
        usd: z.number().optional(),
      }),
    ])
    .optional(),
  stock: z
    .union([
      z.number(),
      z.object({
        quantity: z.number(),
        lowStockThreshold: z.number().optional(),
        inStock: z.boolean().optional(),
      }),
    ])
    .optional(),
  category: z
    .object({
      main: z.string(),
      sub: z.string().optional(),
    })
    .optional(),
  brand: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  sku: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  specifications: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  images: z.array(z.string()).optional(),
  isTrending: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
});

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
      throw new ValidationError("Invalid product ID format");
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new NotFoundError("Product");
    }

    const validatedData = updateProductSchema.parse(body);

    // Update product fields
    if (validatedData.name) product.name = validatedData.name;
    if (validatedData.slug) product.slug = validatedData.slug;
    if (validatedData.description)
      product.description = validatedData.description;
    if (validatedData.shortDescription !== undefined)
      product.shortDescription = validatedData.shortDescription;
    if (validatedData.costPrice !== undefined)
      product.costPrice = validatedData.costPrice;
    if (validatedData.price !== undefined) {
      if (typeof validatedData.price === "number") {
        product.price = { ghs: validatedData.price };
      } else {
        product.price = validatedData.price;
      }
    }
    if (validatedData.stock !== undefined) {
      if (typeof validatedData.stock === "number") {
        product.stock = {
          quantity: validatedData.stock,
          inStock: validatedData.stock > 0,
          lowStockThreshold: product.stock.lowStockThreshold || 10,
        };
      } else {
        product.stock = validatedData.stock;
      }
    }
    if (validatedData.category) product.category = validatedData.category;
    if (validatedData.brand !== undefined) product.brand = validatedData.brand;
    if (validatedData.status) product.status = validatedData.status;
    if (validatedData.sku !== undefined) product.sku = validatedData.sku;
    if (validatedData.weight !== undefined)
      product.weight = validatedData.weight;
    if (validatedData.dimensions) product.dimensions = validatedData.dimensions;
    if (validatedData.tags !== undefined) product.tags = validatedData.tags;
    if (validatedData.highlights !== undefined)
      product.highlights = validatedData.highlights;
    if (validatedData.specifications !== undefined)
      product.specifications = validatedData.specifications;
    if (validatedData.images !== undefined) {
      product.images = validatedData.images.map((url, index) => ({
        url,
        publicId:
          url.split("/").pop()?.split(".")[0] || `product-image-${index}`,
        alt: product.name,
        order: index,
      }));
    }
    if (validatedData.isTrending !== undefined)
      product.isTrending = validatedData.isTrending;
    if (validatedData.isNewArrival !== undefined)
      product.isNewArrival = validatedData.isNewArrival;
    if (validatedData.isBestSeller !== undefined)
      product.isBestSeller = validatedData.isBestSeller;

    await product.save();

    // Invalidate cache
    await deleteCache(cacheKeys.products.detail(id));
    await deleteCache(cacheKeys.products.list("*", 1));

    logRequest(
      "PUT",
      "/api/products/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(product.toObject());
  } catch (error) {
    logger.error("Product update failed", error as Error, {
      endpoint: "/api/products/[id]",
    });
    logRequest(
      "PUT",
      "/api/products/[id]",
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
      throw new ValidationError("Invalid product ID format");
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Invalidate cache
    await deleteCache(cacheKeys.products.detail(id));
    await deleteCache(cacheKeys.products.list("*", 1));

    logRequest(
      "DELETE",
      "/api/products/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({ message: "Product deleted successfully" });
  } catch (error) {
    logger.error("Product deletion failed", error as Error, {
      endpoint: "/api/products/[id]",
    });
    logRequest(
      "DELETE",
      "/api/products/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
