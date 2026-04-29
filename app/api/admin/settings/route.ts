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

// Base schema for full validation
const adminSettingsBaseSchema = z.object({
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
    paystackPublicKey: z.string().optional(),
    paystackSecretKey: z.string().optional(),
    testMode: z.boolean().optional(),
    allowedMethods: z.array(z.string()).optional(),
  }).optional(),
  notifications: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    emailProvider: z.string().optional(),
    smsProvider: z.string().optional(),
    emailFrom: z.string().optional(),
    smsFrom: z.string().optional(),
  }).optional(),
  seo: z.object({
    siteName: z.string().optional(),
    siteDescription: z.string().optional(),
    defaultMetaTags: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }).optional(),
    ogImage: z.string().optional(),
    twitterHandle: z.string().optional(),
  }).optional(),
  business: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      region: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
    taxId: z.string().optional(),
    registrationNumber: z.string().optional(),
  }).optional(),
  socialMedia: z.object({
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

// Partial schema for updates (all fields optional)
const adminSettingsSchema = adminSettingsBaseSchema.partial();

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

/**
 * Deep merge utility for nested objects
 * Preserves existing values when source values are undefined or empty strings (for sensitive fields)
 */
function deepMerge(target: any, source: any, preserveEmptyStrings: string[] = []): any {
  if (!isObject(target) || !isObject(source)) {
    return source !== undefined ? source : target;
  }
  
  const output = { ...target };
  
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    
    // If source value is undefined, keep target value
    if (sourceValue === undefined) {
      return;
    }
    
    // If both are objects (and not arrays), merge recursively
    if (isObject(target[key]) && isObject(sourceValue) && !Array.isArray(sourceValue)) {
      output[key] = deepMerge(target[key], sourceValue, preserveEmptyStrings);
    } else {
      // For sensitive fields like payment keys, preserve existing value if new value is empty
      if (preserveEmptyStrings.includes(key) && sourceValue === "" && target[key]) {
        output[key] = target[key];
      } else {
        // Otherwise, use source value (including null, empty strings, etc.)
        output[key] = sourceValue;
      }
    }
  });
  
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item);
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    // Validate input (partial updates allowed)
    const validatedData = adminSettingsSchema.parse(body);

    // Ensure only one document exists
    const settings = await AdminSettings.findOne({});

    if (!settings) {
      // If no settings exist, we need all required fields
      // For now, create with defaults and merge
      throw new NotFoundError("Admin settings not found. Please create initial settings first.");
    } else {
      // Deep merge nested objects to preserve existing values when not provided
      const existingData = settings.toObject();
      
      // For payment object, preserve existing keys if new values are empty strings
      if (validatedData.payment) {
        const existingPayment = existingData.payment || {};
        if (validatedData.payment.paystackPublicKey === "" && existingPayment.paystackPublicKey) {
          validatedData.payment.paystackPublicKey = existingPayment.paystackPublicKey;
        }
        if (validatedData.payment.paystackSecretKey === "" && existingPayment.paystackSecretKey) {
          validatedData.payment.paystackSecretKey = existingPayment.paystackSecretKey;
        }
      }
      
      const mergedData = deepMerge(existingData, validatedData);
      
      // Update settings with merged data, preserving existing nested objects
      Object.keys(mergedData).forEach((key) => {
        if (key !== "_id" && key !== "__v" && key !== "createdAt" && key !== "updatedAt" && key !== "updatedBy") {
          // Use markModified for nested objects to ensure Mongoose saves them
          if (isObject(mergedData[key]) && !Array.isArray(mergedData[key])) {
            (settings as any)[key] = mergedData[key];
            (settings as any).markModified(key);
          } else {
            (settings as any)[key] = mergedData[key];
          }
        }
      });
    }

    (settings as any).updatedBy = session.user.id;
    await settings.save();

    return successResponse(settings.toObject());
  } catch (error) {
    return handleApiError(error);
  }
}
