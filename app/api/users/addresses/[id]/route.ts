import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { normalizePhoneNumber } from "@/lib/utils/phone";

const updateAddressSchema = z.object({
  type: z.enum(["shipping", "billing"]).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address: z.string().optional(),
  apartment: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  phone: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid address ID");
    }

    const validatedData = updateAddressSchema.parse(body);

    const user = await User.findById(session.user.id);

    if (!user) {
      throw new NotFoundError("User");
    }

    const addressIndex = user.addresses?.findIndex(
      (addr: any) => addr._id.toString() === id
    );

    if (addressIndex === undefined || addressIndex === -1) {
      throw new NotFoundError("Address");
    }

    // If setting as default, unset other defaults of same type
    if (validatedData.isDefault) {
      const currentAddress = user.addresses[addressIndex];
      user.addresses.forEach((addr: any, idx: number) => {
        if (
          idx !== addressIndex &&
          addr.type === (validatedData.type || currentAddress.type)
        ) {
          addr.isDefault = false;
        }
      });
    }

    // Update address
    const address = user.addresses[addressIndex];
    if (validatedData.type) address.type = validatedData.type;
    if (validatedData.firstName) address.firstName = validatedData.firstName;
    if (validatedData.lastName) address.lastName = validatedData.lastName;
    if (validatedData.address) address.address = validatedData.address;
    if (validatedData.apartment !== undefined)
      address.apartment = validatedData.apartment;
    if (validatedData.city) address.city = validatedData.city;
    if (validatedData.region) address.region = validatedData.region;
    if (validatedData.postalCode !== undefined)
      address.postalCode = validatedData.postalCode;
    if (validatedData.phone)
      address.phone = normalizePhoneNumber(validatedData.phone);
    if (validatedData.isDefault !== undefined)
      address.isDefault = validatedData.isDefault;

    await user.save();

    return successResponse(user.addresses[addressIndex]);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid address ID");
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      throw new NotFoundError("User");
    }

    user.addresses = user.addresses.filter(
      (addr: any) => addr._id.toString() !== id
    );
    await user.save();

    return successResponse({ message: "Address deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
