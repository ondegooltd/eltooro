import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { logger, logRequest } from "@/lib/logger";
import { initModels } from "@/lib/models/helpers";
import { SMSTemplate } from "@/lib/models";
import {
  SMSEventType,
  validateTemplateLength,
  validateTemplateVariables,
  extractTemplateVariables,
} from "@/lib/notifications/sms-templates";
import { invalidateTemplateCache } from "@/lib/notifications/sms-template-service";

const createTemplateSchema = z.object({
  eventType: z.nativeEnum(SMSEventType),
  name: z.string().min(1),
  message: z.string().min(1),
  status: z.enum(["active", "inactive"]).default("active"),
  isDefault: z.boolean().default(false),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/admin/sms-templates - List all SMS templates
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const eventType = searchParams.get("eventType") as SMSEventType | null;
    const status = searchParams.get("status");

    const query: any = {};
    if (eventType) {
      query.eventType = eventType;
    }
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      SMSTemplate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SMSTemplate.countDocuments(query),
    ]);

    logRequest(
      "GET",
      "/api/admin/sms-templates",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(templates, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("SMS templates list failed", error as Error, {
      endpoint: "/api/admin/sms-templates",
    });
    logRequest(
      "GET",
      "/api/admin/sms-templates",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/sms-templates - Create new SMS template
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    const validatedData = createTemplateSchema.parse(body);

    // Validate template length
    const lengthValidation = validateTemplateLength(validatedData.message);
    if (!lengthValidation.valid) {
      throw new ValidationError(
        `Template message exceeds 160 characters by ${lengthValidation.exceeds} characters`
      );
    }

    // Validate template variables
    const varValidation = validateTemplateVariables(
      validatedData.message,
      validatedData.eventType
    );
    if (!varValidation.valid) {
      throw new ValidationError(
        `Invalid variables: ${varValidation.invalidVariables.join(
          ", "
        )}. Available variables: ${varValidation.availableVariables.join(", ")}`
      );
    }

    // Extract variables
    const variables = extractTemplateVariables(validatedData.message);

    // If setting as default, unset other defaults for this event type
    if (validatedData.isDefault) {
      await SMSTemplate.updateMany(
        {
          eventType: validatedData.eventType,
          isDefault: true,
        },
        {
          $set: { isDefault: false },
        }
      );
    }

    // Create template
    const template = new SMSTemplate({
      eventType: validatedData.eventType,
      name: validatedData.name,
      message: validatedData.message,
      variables,
      status: validatedData.status,
      isDefault: validatedData.isDefault,
      usageCount: 0,
      updatedBy: session.user.id,
    });

    await template.save();

    // Invalidate cache
    await invalidateTemplateCache(validatedData.eventType);

    const createdTemplate = template.toObject();

    logRequest(
      "POST",
      "/api/admin/sms-templates",
      201,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(createdTemplate, {}, 201);
  } catch (error) {
    logger.error("SMS template creation failed", error as Error, {
      endpoint: "/api/admin/sms-templates",
    });
    logRequest(
      "POST",
      "/api/admin/sms-templates",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
