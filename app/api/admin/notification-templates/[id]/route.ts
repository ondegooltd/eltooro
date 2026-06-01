import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { NotificationTemplate } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors/api-error";
import mongoose from "mongoose";
import { z } from "zod";
import { logger, logRequest } from "@/lib/logger";

const updateTemplateSchema = z.object({
  channel: z.enum(["email", "sms"]).optional(),
  event: z.string().min(1).optional(),
  subject: z.string().optional(),
  body: z.string().min(1).optional(),
  isEnabled: z.boolean().optional(),
  locale: z.string().optional(),
});

/**
 * GET /api/admin/notification-templates/[id] - Get a single template
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

    const template = await NotificationTemplate.findById(id).lean();

    if (!template) {
      throw new NotFoundError("Notification template");
    }

    logRequest(
      "GET",
      "/api/admin/notification-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(template);
  } catch (error) {
    logger.error("Notification template fetch failed", error as Error, {
      endpoint: "/api/admin/notification-templates/[id]",
    });
    logRequest(
      "GET",
      "/api/admin/notification-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * PUT /api/admin/notification-templates/[id] - Update a template
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

    const template = await NotificationTemplate.findById(id);

    if (!template) {
      throw new NotFoundError("Notification template");
    }

    const validatedData = updateTemplateSchema.parse(body);

    // Validate subject for email templates
    if (
      (validatedData.channel === "email" || template.channel === "email") &&
      validatedData.subject === undefined &&
      !template.subject
    ) {
      throw new ValidationError("Subject is required for email templates");
    }

    // Check for conflicts if channel/event/locale is being changed
    if (
      (validatedData.channel || validatedData.event || validatedData.locale) &&
      (validatedData.channel !== template.channel ||
        validatedData.event !== template.event ||
        validatedData.locale !== template.locale)
    ) {
      const checkChannel = validatedData.channel || template.channel;
      const checkEvent = validatedData.event || template.event;
      const checkLocale = validatedData.locale || template.locale;

      const existing = await NotificationTemplate.findOne({
        channel: checkChannel,
        event: checkEvent,
        locale: checkLocale,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictError(
          "Template already exists for this channel, event, and locale"
        );
      }
    }

    // Update fields
    if (validatedData.channel !== undefined)
      template.channel = validatedData.channel;
    if (validatedData.event !== undefined) template.event = validatedData.event;
    if (validatedData.subject !== undefined)
      template.subject = validatedData.subject;
    if (validatedData.body !== undefined) template.body = validatedData.body;
    if (validatedData.isEnabled !== undefined)
      template.isEnabled = validatedData.isEnabled;
    if (validatedData.locale !== undefined)
      template.locale = validatedData.locale;
    template.updatedBy = session.user.id;

    await template.save();

    logRequest(
      "PUT",
      "/api/admin/notification-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(template.toObject());
  } catch (error) {
    logger.error("Notification template update failed", error as Error, {
      endpoint: "/api/admin/notification-templates/[id]",
    });
    logRequest(
      "PUT",
      "/api/admin/notification-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/notification-templates/[id] - Delete a template
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

    const template = await NotificationTemplate.findByIdAndDelete(id);

    if (!template) {
      throw new NotFoundError("Notification template");
    }

    logRequest(
      "DELETE",
      "/api/admin/notification-templates/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({ message: "Template deleted successfully" });
  } catch (error) {
    logger.error("Notification template deletion failed", error as Error, {
      endpoint: "/api/admin/notification-templates/[id]",
    });
    logRequest(
      "DELETE",
      "/api/admin/notification-templates/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
