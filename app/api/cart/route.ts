import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Cart, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();

    const cart = await Cart.findOne({
      userId: session.user.id,
    }).lean();

    if (!cart) {
      return successResponse({ items: [] });
    }

    // Populate product details
    const items = await Promise.all(
      cart.items.map(async (item: any) => {
        const product = await Product.findById(item.productId).lean();
        return {
          ...item,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                brand: product.brand,
                image: product.images?.[0]?.url || "/placeholder.svg",
                price:
                  typeof product.price === "object"
                    ? product.price.ghs
                    : product.price,
                originalPrice: product.originalPrice
                  ? typeof product.originalPrice === "object"
                    ? product.originalPrice.ghs
                    : product.originalPrice
                  : undefined,
                slug: product.slug,
              }
            : null,
        };
      })
    );

    return successResponse({ ...cart, items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = cartItemSchema.parse(body);

    // Support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(validatedData.productId);
    const productQuery: any = isObjectId
      ? { _id: validatedData.productId }
      : { slug: validatedData.productId };
    productQuery.status = "active";

    // Verify product exists and is in stock
    const product = await Product.findOne(productQuery);

    if (!product) {
      throw new NotFoundError("Product");
    }

    if (
      !product.stock?.inStock ||
      product.stock.quantity < validatedData.quantity
    ) {
      throw new ValidationError("Insufficient stock");
    }

    // Get or create cart
    let cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (cart) {
      // Update existing cart
      // Compare using product._id (ObjectId) since cart items store ObjectId
      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === product._id.toString()
      );

      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += validatedData.quantity;
      } else {
        cart.items.push({
          productId: product._id,
          quantity: validatedData.quantity,
          addedAt: new Date(),
        } as any);
      }

      await cart.save();
    } else {
      // Create new cart
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      cart = new Cart({
        userId: session.user.id,
        items: [
          {
            productId: product._id,
            quantity: validatedData.quantity,
            addedAt: new Date(),
          },
        ],
        expiresAt,
      });

      await cart.save();
    }

    return successResponse({ message: "Item added to cart" }, {}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();

    await Cart.deleteOne({
      userId: session.user.id,
    });

    return successResponse({ message: "Cart cleared" });
  } catch (error) {
    return handleApiError(error);
  }
}
