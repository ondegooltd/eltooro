import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { z } from "zod";
import { normalizePhoneNumber } from "@/lib/utils/phone";

const updateProfileSchema = z.object({
  name: z
    .object({
      first: z.string().optional(),
      last: z.string().optional(),
    })
    .optional(),
  phone: z.string().optional(),
  preferences: z
    .object({
      currency: z.enum(["GHS", "USD"]).optional(),
      language: z.string().optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();

    const user = await User.findById(session.user.id)
      .select("-password")
      .lean();

    if (!user) {
      return successResponse(null);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = updateProfileSchema.parse(body);

    const user = await User.findById(session.user.id);

    if (!user) {
      return successResponse(null);
    }

    if (validatedData.name) {
      user.name = {
        ...user.name,
        ...validatedData.name,
      };
    }

    if (validatedData.phone) {
      user.phone = normalizePhoneNumber(validatedData.phone);
    }

    if (validatedData.preferences) {
      user.preferences = {
        ...user.preferences,
        ...validatedData.preferences,
        notifications: {
          ...user.preferences.notifications,
          ...(validatedData.preferences.notifications || {}),
        },
      };
    }

    await user.save();

    const userData = user.toObject();
    delete (userData as any).password;

    return successResponse(userData);
  } catch (error) {
    return handleApiError(error);
  }
}
