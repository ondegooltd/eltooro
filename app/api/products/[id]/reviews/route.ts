import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Product, Review } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(1),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
      })
    )
    .optional(),
  orderId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initModels();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Support both ObjectId and slug - if not ObjectId, find product by slug first
    let productId = id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const product = await Product.findOne({ slug: id, status: "active" }).lean();
      if (!product) {
        throw new NotFoundError("Product");
      }
      productId = product._id.toString();
    }

    const [reviews, total] = await Promise.all([
      Review.find({
        productId: productId,
      })
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({
        productId: productId,
      }),
    ]);

    return successResponse(reviews, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    // Support both ObjectId and slug - find product first
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const productQuery: any = isObjectId ? { _id: id } : { slug: id };
    const product = await Product.findOne(productQuery);

    if (!product) {
      throw new NotFoundError("Product");
    }

    // Use product._id for review creation
    const productId = product._id.toString();

    // Validate input
    const validatedData = reviewSchema.parse(body);

    // Create review
    const review = new Review({
      productId: productId,
      userId: session.user.id,
      orderId: validatedData.orderId || undefined,
      rating: validatedData.rating,
      title: validatedData.title,
      comment: validatedData.comment,
      images: validatedData.images || [],
      verified: !!validatedData.orderId,
      helpful: 0,
      reported: false,
    });

    await review.save();

    // Update product rating
    const allReviews = await Review.find({ productId: productId }).lean();

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = {
      average: avgRating,
      count: allReviews.length,
    };
    await product.save();

    return successResponse(review.toObject(), {}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
