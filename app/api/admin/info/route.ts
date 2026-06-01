import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { AdminInfo } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";

const adminInfoTypes = [
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
] as const;

const adminInfoSchema = z.object({
  type: z.enum(adminInfoTypes as any),
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  order: z.number().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    // Check if user is admin
    const authHeader = request.headers.get("authorization");
    const isAdmin = !!authHeader;

    const query: any = {};

    // Public users can only see published content
    if (!isAdmin) {
      query.status = "published";
    } else if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AdminInfo.find(query)
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminInfo.countDocuments(query),
    ]);

    return successResponse(data, {
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

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    // Validate input
    const validatedData = adminInfoSchema.parse(body);

    // Check if slug already exists
    const existing = await AdminInfo.findOne({
      slug: validatedData.slug,
    });

    if (existing) {
      throw new ValidationError("Slug already exists", "slug");
    }

    // Create new admin info
    const adminInfo = new AdminInfo(validatedData);
    await adminInfo.save();

    return successResponse(adminInfo.toObject(), {}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
