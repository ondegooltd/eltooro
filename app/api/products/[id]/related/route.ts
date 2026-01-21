import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initModels();
    const { id } = await params;

    // Support both ObjectId and slug
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const product = isObjectId
      ? await Product.findById(id).lean()
      : await Product.findOne({ slug: id }).lean();

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Find related products: same category, same brand, or similar price range
    const priceRange = product.price?.ghs || 0;
    const priceMin = priceRange * 0.7;
    const priceMax = priceRange * 1.3;

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      status: "active",
      $or: [
        { "category.main": product.category?.main },
        { brand: product.brand },
        {
          "price.ghs": {
            $gte: priceMin,
            $lte: priceMax,
          },
        },
        ...(product.tags && product.tags.length > 0
          ? [{ tags: { $in: product.tags } }]
          : []),
      ],
    })
      .limit(8)
      .lean();

    return successResponse(relatedProducts);
  } catch (error) {
    return handleApiError(error);
  }
}
