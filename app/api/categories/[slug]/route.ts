import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Category } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { NotFoundError } from "@/lib/errors/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await initModels();
    const { slug } = await params;

    const category = await Category.findOne({
      slug,
      isActive: true,
    }).lean();

    if (!category) {
      throw new NotFoundError("Category");
    }

    // Get subcategories if any
    const subcategories = await Category.find({
      parentId: category._id,
      isActive: true,
    })
      .sort({ order: 1 })
      .lean();

    return successResponse({
      ...category,
      subcategories,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
