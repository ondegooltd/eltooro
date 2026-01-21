import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Wishlist, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";

const wishlistItemSchema = z.object({
  productId: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();

    const wishlist = await Wishlist.findOne({
      userId: session.user.id,
    }).lean();

    if (!wishlist) {
      return successResponse({ items: [] });
    }

    // Populate product details
    const items = await Promise.all(
      wishlist.items.map(async (item: any) => {
        const product = await Product.findById(item.productId).lean();
        return {
          ...item,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                brand: product.brand,
                image: product.images?.[0]?.url,
                price: product.price?.ghs,
                slug: product.slug,
              }
            : null,
        };
      })
    );

    return successResponse({ ...wishlist, items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = wishlistItemSchema.parse(body);

    // Support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(validatedData.productId);
    const productQuery: any = isObjectId
      ? { _id: validatedData.productId }
      : { slug: validatedData.productId };
    productQuery.status = "active";

    // Verify product exists
    const product = await Product.findOne(productQuery);

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({
      userId: session.user.id,
    });

    if (wishlist) {
      // Check if product already in wishlist
      const exists = wishlist.items.some(
        (item: any) => item.productId.toString() === product._id.toString()
      );

      if (exists) {
        throw new ValidationError("Product already in wishlist");
      }

      // Add to wishlist
      wishlist.items.push({
        productId: product._id,
        addedAt: new Date(),
      } as any);
      await wishlist.save();
    } else {
      // Create new wishlist
      wishlist = new Wishlist({
        userId: session.user.id,
        items: [
          {
            productId: product._id,
            addedAt: new Date(),
          },
        ],
      });
      await wishlist.save();
    }

    return successResponse({ message: "Product added to wishlist" }, {}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
