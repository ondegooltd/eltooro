import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Wishlist, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    const wishlist = await Wishlist.findOne({
      userId: session.user.id,
    });

    if (!wishlist) {
      throw new NotFoundError("Wishlist");
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

    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId.toString() !== product._id.toString()
    );
    await wishlist.save();

    return successResponse({ message: "Product removed from wishlist" });
  } catch (error) {
    return handleApiError(error);
  }
}
