import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ValidationError("No file provided");
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError("Invalid file type. Only images are allowed");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ValidationError("File size exceeds 5MB limit");
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const { uploadImage } = await import("@/lib/cloudinary");
    const rawFolder = formData.get("folder")?.toString() || "products";
    const folder =
      rawFolder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 64) || "products";
    const result = await uploadImage(buffer, folder);

    return successResponse({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
