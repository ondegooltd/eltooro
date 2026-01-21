import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { AdminInfo } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";

const adminInfoUpdateSchema = z.object({
  type: z
    .enum([
      "privacy_policy",
      "terms_of_service",
      "terms_and_conditions",
      "faq",
      "contact",
      "about_us",
      "shipping_policy",
      "return_policy",
      "refund_policy",
      "cancellation_policy",
      "accessibility",
      "affiliate_terms",
      "blog_post",
      "announcement",
      "help_article",
      "custom",
    ] as any)
    .optional(),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  order: z.number().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    await initModels();
    const { identifier } = await params;

    // Check if identifier is a valid ObjectId (ID) or a slug
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);

    let info;
    if (isObjectId) {
      // Admin access required for ID-based lookup
      await requireAdmin(request);
      info = await AdminInfo.findById(identifier).lean();
    } else {
      // Public access for slug-based lookup (published content only)
      info = await AdminInfo.findOne({
        slug: identifier,
        status: "published",
      }).lean();

      // Increment view counter for public slug access
      if (info) {
        await AdminInfo.findByIdAndUpdate(info._id, { $inc: { views: 1 } });
      }
    }

    if (!info) {
      throw new NotFoundError("Admin info");
    }

    return successResponse(info);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { identifier } = await params;
    const body = await request.json();

    // Only allow updates by ID
    if (!mongoose.Types.ObjectId.isValid(identifier)) {
      throw new ValidationError(
        "Invalid ID format. Updates require a valid ID."
      );
    }

    // Validate input
    const validatedData = adminInfoUpdateSchema.parse(body);

    const info = await AdminInfo.findById(identifier);

    if (!info) {
      throw new NotFoundError("Admin info");
    }

    // If slug is being updated, check uniqueness (excluding current record)
    if (validatedData.slug && validatedData.slug !== info.slug) {
      const existing = await AdminInfo.findOne({
        slug: validatedData.slug,
        _id: { $ne: identifier },
      });

      if (existing) {
        throw new ValidationError("Slug already exists", "slug");
      }
    }

    // Update admin info
    if (validatedData.type) info.type = validatedData.type as any;
    if (validatedData.title) info.title = validatedData.title;
    if (validatedData.slug) info.slug = validatedData.slug;
    if (validatedData.content) info.content = validatedData.content;
    if (validatedData.excerpt !== undefined)
      info.excerpt = validatedData.excerpt;
    if (validatedData.status) info.status = validatedData.status as any;
    if (validatedData.order !== undefined) info.order = validatedData.order;
    if (validatedData.tags) info.tags = validatedData.tags;
    if (validatedData.metadata) info.metadata = validatedData.metadata;

    await info.save();

    return successResponse(info.toObject());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { identifier } = await params;

    // Only allow deletes by ID
    if (!mongoose.Types.ObjectId.isValid(identifier)) {
      throw new ValidationError(
        "Invalid ID format. Deletes require a valid ID."
      );
    }

    const info = await AdminInfo.findById(identifier);

    if (!info) {
      throw new NotFoundError("Admin info");
    }

    // Soft delete: Set status to archived
    info.status = "archived";
    await info.save();

    return successResponse({ message: "Admin info archived successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
