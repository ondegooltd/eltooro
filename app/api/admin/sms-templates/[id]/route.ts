import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { SMSTemplate } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import {
  validateTemplateLength,
  validateTemplateVariables,
  extractTemplateVariables,
  SMSEventType,
} from "@/lib/notifications/sms-templates";
import { invalidateTemplateCache } from "@/lib/notifications/sms-template-service";

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/admin/sms-templates/[id] - Get single template
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid template ID format");
    }

    const template = await SMSTemplate.findById(id).lean();

    if (!template) {
      throw new NotFoundError("SMS template");
    }

    logRequest(
      "GET",
      "/api/admin/sms-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(template);
  } catch (error) {
    logger.error("SMS template fetch failed", error as Error, {
      endpoint: "/api/admin/sms-templates/[id]",
    });
    logRequest(
      "GET",
      "/api/admin/sms-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/sms-templates/[id] - Update template
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid template ID format");
    }

    const template = await SMSTemplate.findById(id);

    if (!template) {
      throw new NotFoundError("SMS template");
    }

    const validatedData = updateTemplateSchema.parse(body);

    // Validate message length if being updated
    if (validatedData.message) {
      const lengthValidation = validateTemplateLength(validatedData.message);
      if (!lengthValidation.valid) {
        throw new ValidationError(
          `Template message exceeds 160 characters by ${lengthValidation.exceeds} characters`
        );
      }

      // Validate template variables
      const eventType = template.eventType as SMSEventType;
      const varValidation = validateTemplateVariables(
        validatedData.message,
        eventType
      );
      if (!varValidation.valid) {
        throw new ValidationError(
          `Invalid variables: ${varValidation.invalidVariables.join(
            ", "
          )}. Available variables: ${varValidation.availableVariables.join(
            ", "
          )}`
        );
      }
    }

    if (validatedData.name) {
      template.name = validatedData.name;
    }

    if (validatedData.message) {
      template.message = validatedData.message;
      template.variables = extractTemplateVariables(validatedData.message);
    }

    if (validatedData.status) {
      template.status = validatedData.status as any;
    }

    // If setting as default, unset other defaults for this event type
    if (validatedData.isDefault === true) {
      await SMSTemplate.updateMany(
        {
          eventType: template.eventType,
          isDefault: true,
          _id: { $ne: id },
        },
        {
          $set: { isDefault: false },
        }
      );
      template.isDefault = true;
    } else if (validatedData.isDefault === false) {
      template.isDefault = false;
    }

    (template as any).updatedBy = session.user.id;
    await template.save();

    // Invalidate cache
    await invalidateTemplateCache(template.eventType as SMSEventType);

    logRequest(
      "PUT",
      "/api/admin/sms-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(template.toObject());
  } catch (error) {
    logger.error("SMS template update failed", error as Error, {
      endpoint: "/api/admin/sms-templates/[id]",
    });
    logRequest(
      "PUT",
      "/api/admin/sms-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/sms-templates/[id] - Delete template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid template ID format");
    }

    const template = await SMSTemplate.findById(id);

    if (!template) {
      throw new NotFoundError("SMS template");
    }

    // Don't allow deleting default templates
    if (template.isDefault) {
      throw new ValidationError(
        "Cannot delete default template. Set another as default first."
      );
    }

    const eventType = template.eventType;
    await SMSTemplate.findByIdAndDelete(id);

    // Invalidate cache
    await invalidateTemplateCache(eventType as SMSEventType);

    logRequest(
      "DELETE",
      "/api/admin/sms-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({ message: "Template deleted successfully" });
  } catch (error) {
    logger.error("SMS template deletion failed", error as Error, {
      endpoint: "/api/admin/sms-templates/[id]",
    });
    logRequest(
      "DELETE",
      "/api/admin/sms-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
