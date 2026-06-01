import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { AdminInfo } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";

const validTypes = [
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

export async function GET(request: NextRequest) {
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const types = searchParams.getAll("type");

    if (types.length === 0) {
      return successResponse([]);
    }

    // Validate types
    const validTypesArray = types.filter((t) =>
      validTypes.includes(t as any)
    ) as string[];

    if (validTypesArray.length === 0) {
      return successResponse([]);
    }

    // Get published records of specified types
    const data = await AdminInfo.find({
      type: { $in: validTypesArray },
      status: "published",
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}
