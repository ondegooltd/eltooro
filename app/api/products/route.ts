import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product, Category } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";
import {
  getCache,
  setCache,
  deleteCache,
  cacheKeys,
  CACHE_TTL,
} from "@/lib/cache/redis";
import { logger, logRequest } from "@/lib/logger";
import { z } from "zod";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category") || "all";
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const status = searchParams.get("status") || "active";
    const type = searchParams.get("type"); // trending, best-sellers, new-arrivals, recommended

    // Check cache (only for simple queries without filters)
    const cacheKey = cacheKeys.products.list(category, page);
    if (
      !brand &&
      !minPrice &&
      !maxPrice &&
      sortBy === "createdAt" &&
      sortOrder === "desc"
    ) {
      const cached = await getCache<{ data: any[]; meta: { pagination: any } }>(
        cacheKey
      );
      if (cached && cached.data && cached.meta) {
        logRequest("GET", "/api/products", 200, Date.now() - startTime);
        return successResponse(cached.data, cached.meta);
      }
    }

    const query: any = { status };

    // Handle product type filters
    if (type === "trending") {
      query.isTrending = true;
    } else if (type === "best-sellers") {
      query.isBestSeller = true;
    } else if (type === "new-arrivals") {
      query.isNewArrival = true;
    } else if (type === "recommended") {
      // Recommended products are those with high ratings, sales, or best seller flag
      // We'll sort by these criteria instead of filtering
    }

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

    if (brand) {
      query.brand = brand;
    }

    if (minPrice || maxPrice) {
      query["price.ghs"] = {};
      if (minPrice) {
        query["price.ghs"].$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query["price.ghs"].$lte = parseFloat(maxPrice);
      }
    }

    const skip = (page - 1) * limit;
    let sort: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Special sorting for recommended products
    if (type === "recommended") {
      sort = {
        "rating.average": -1,
        sales: -1,
        isBestSeller: -1,
        createdAt: -1,
      };
    }

    const [data, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    const responseData = {
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };

    // Cache result (only for simple queries)
    if (
      !brand &&
      !minPrice &&
      !maxPrice &&
      sortBy === "createdAt" &&
      sortOrder === "desc"
    ) {
      await setCache(cacheKey, responseData, CACHE_TTL.PRODUCTS);
    }

    logRequest("GET", "/api/products", 200, Date.now() - startTime);
    return successResponse(data, responseData.meta);
  } catch (error) {
    logger.error("Products list failed", error as Error, {
      endpoint: "/api/products",
    });
    logRequest(
      "GET",
      "/api/products",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  costPrice: z.number().optional(),
  price: z.union([
    z.number(),
    z.object({
      ghs: z.number(),
      usd: z.number().optional(),
    }),
  ]),
  stock: z.union([
    z.number(),
    z.object({
      quantity: z.number(),
      lowStockThreshold: z.number().optional(),
      inStock: z.boolean().optional(),
    }),
  ]),
  category: z.object({
    main: z.string(),
    sub: z.string().optional(),
  }),
  brand: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).default("active"),
  sku: z.string().optional(),
  weight: z.number().optional(),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  images: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    const validatedData = createProductSchema.parse(body);

    // Check if slug already exists
    const existingProduct = await Product.findOne({
      slug: validatedData.slug,
    });

    if (existingProduct) {
      throw new ValidationError("Product with this slug already exists");
    }

    // Generate SKU if not provided
    const sku =
      validatedData.sku ||
      `SKU-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;

    // Prepare product document
    const product = new Product({
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description,
      costPrice: validatedData.costPrice,
      price:
        typeof validatedData.price === "number"
          ? { ghs: validatedData.price }
          : validatedData.price,
      stock:
        typeof validatedData.stock === "number"
          ? {
              quantity: validatedData.stock,
              inStock: validatedData.stock > 0,
            }
          : validatedData.stock,
      category: validatedData.category,
      brand: validatedData.brand,
      status: validatedData.status,
      sku,
      weight: validatedData.weight,
      dimensions: validatedData.dimensions,
      images:
        validatedData.images?.map((url, index) => ({
          url,
          publicId:
            url.split("/").pop()?.split(".")[0] || `product-image-${index}`,
          alt: validatedData.name,
          order: index,
        })) || [],
      rating: {
        average: 0,
        count: 0,
      },
      views: 0,
      sales: 0,
    });

    await product.save();

    // Invalidate cache
    await deleteCache(cacheKeys.products.list("*", 1));

    logRequest(
      "POST",
      "/api/products",
      201,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(product.toObject(), {}, 201);
  } catch (error) {
    logger.error("Product creation failed", error as Error, {
      endpoint: "/api/products",
    });
    logRequest(
      "POST",
      "/api/products",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
