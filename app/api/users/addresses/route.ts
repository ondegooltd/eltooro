import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { normalizePhoneNumber } from "@/lib/utils/phone";

const addressSchema = z.object({
  type: z.enum(["shipping", "billing"]),
  firstName: z.string(),
  lastName: z.string(),
  address: z.string(),
  apartment: z.string().optional(),
  city: z.string(),
  region: z.string(),
  postalCode: z.string().optional(),
  phone: z.string(),
  isDefault: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();

    const user = await User.findById(session.user.id)
      .select("addresses")
      .lean();

    return successResponse(user?.addresses || []);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = addressSchema.parse(body);

    const user = await User.findById(session.user.id);

    if (!user) {
      throw new ValidationError("User not found");
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(validatedData.phone);

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      ...validatedData,
      phone: normalizedPhone,
      createdAt: new Date(),
    };

    // If this is set as default, unset other defaults of same type
    if (validatedData.isDefault) {
      user.addresses.forEach((addr: any) => {
        if (addr.type === validatedData.type) {
          addr.isDefault = false;
        }
      });
    }

    user.addresses.push(newAddress as any);
    await user.save();

    return successResponse(newAddress, {}, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
