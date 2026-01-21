import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { AdminSettings } from "@/lib/models";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";

const adminSettingsSchema = z.object({
  deliveryFees: z.object({
    winneba: z.number(),
    mankesim: z.number(),
    accra: z.number(),
    capeCoast: z.number(),
    takoradi: z.number(),
    kumasi: z.number(),
    sunyani: z.number(),
    international: z.number(),
  }),
  serviceFees: z.object({
    ghana: z.number(),
    international: z.number(),
  }),
  deliveryTimes: z.object({
    winneba: z.object({ min: z.number(), max: z.number() }),
    accraCentral: z.object({ min: z.number(), max: z.number() }),
    outsideAccraCentral: z.object({ min: z.number(), max: z.number() }),
    international: z.object({ min: z.number(), max: z.number() }),
  }),
  settings: z.object({
    currency: z.object({
      default: z.string(),
      supported: z.array(z.string()),
    }),
    freeShippingThreshold: z.number(),
    lowStockThreshold: z.number(),
    orderPrefix: z.string(),
    maintenanceMode: z.boolean(),
    allowGuestCheckout: z.boolean(),
    requireEmailVerification: z.boolean(),
    requirePhoneVerification: z.boolean(),
    maxCartItems: z.number().optional(),
    maxQuantityPerItem: z.number().optional(),
  }),
  payment: z.object({
    paystackPublicKey: z.string(),
    paystackSecretKey: z.string(),
    testMode: z.boolean(),
    allowedMethods: z.array(z.string()).optional(),
  }),
  notifications: z.object({
    emailEnabled: z.boolean(),
    smsEnabled: z.boolean(),
    emailProvider: z.string(),
    smsProvider: z.string(),
    emailFrom: z.string().optional(),
    smsFrom: z.string().optional(),
  }),
  seo: z.object({
    siteName: z.string(),
    siteDescription: z.string(),
    defaultMetaTags: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
    ogImage: z.string().optional(),
    twitterHandle: z.string().optional(),
  }),
  business: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      region: z.string(),
      country: z.string(),
      postalCode: z.string().optional(),
    }),
    taxId: z.string().optional(),
    registrationNumber: z.string().optional(),
  }),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }),
});

export async function GET(request: NextRequest) {
  try {
    await initModels();
    const settings = await AdminSettings.findOne({}).lean();

    if (!settings) {
      throw new NotFoundError("Admin settings");
    }

    // For public access, return only delivery fees, service fees, and delivery times
    const isPublic = !request.headers.get("authorization");
    if (isPublic) {
      return successResponse({
        deliveryFees: settings.deliveryFees,
        serviceFees: settings.serviceFees,
        deliveryTimes: settings.deliveryTimes,
      });
    }

    // For admin access, return full settings
    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    // Validate input
    const validatedData = adminSettingsSchema.parse(body);

    // Ensure only one document exists - use findOneAndUpdate with upsert
    let settings = await AdminSettings.findOne({});

    if (!settings) {
      settings = new AdminSettings(validatedData);
    } else {
      Object.assign(settings, validatedData);
    }

    (settings as any).updatedBy = session.user.id;
    await settings.save();

    return successResponse(settings.toObject());
  } catch (error) {
    return handleApiError(error);
  }
}
