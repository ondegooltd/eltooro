import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Cart, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";

const updateCartItemSchema = z.object({
  quantity: z.number().min(1),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    const validatedData = updateCartItemSchema.parse(body);

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      throw new NotFoundError("Cart");
    }

    // Support both ObjectId and slug - find product first
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const productQuery: any = isObjectId
      ? { _id: id }
      : { slug: id };
    
    const product = await Product.findOne(productQuery);

    if (!product) {
      throw new NotFoundError("Product");
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === product._id.toString()
    );

    if (itemIndex === -1) {
      throw new NotFoundError("Cart item");
    }

    if (
      !product.stock?.inStock ||
      product.stock.quantity < validatedData.quantity
    ) {
      throw new ValidationError("Insufficient stock");
    }

    cart.items[itemIndex].quantity = validatedData.quantity;
    await cart.save();

    return successResponse({ message: "Cart item updated" });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      throw new NotFoundError("Cart");
    }

    // Support both ObjectId and slug - find product first
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const productQuery: any = isObjectId
      ? { _id: id }
      : { slug: id };
    
    const product = await Product.findOne(productQuery);

    if (!product) {
      throw new NotFoundError("Product");
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== product._id.toString()
    );
    await cart.save();

    return successResponse({ message: "Item removed from cart" });
  } catch (error) {
    return handleApiError(error);
  }
}
