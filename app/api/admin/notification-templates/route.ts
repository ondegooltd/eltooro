import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { NotificationTemplate } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError, ConflictError } from "@/lib/errors/api-error";
import { z } from "zod";
import { logger, logRequest } from "@/lib/logger";

const createTemplateSchema = z.object({
  channel: z.enum(["email", "sms"]),
  event: z.string().min(1, "Event is required"),
  subject: z.string().optional(), // Required for email
  body: z.string().min(1, "Body is required"),
  isEnabled: z.boolean().default(true),
  locale: z.string().default("en"),
});

const updateTemplateSchema = createTemplateSchema.partial();

/**
 * GET /api/admin/notification-templates - List all notification templates
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const { searchParams } = new URL(request.url);

    const channel = searchParams.get("channel");
    const event = searchParams.get("event");
    const locale = searchParams.get("locale") || "en";

    const query: any = {};
    if (channel) query.channel = channel;
    if (event) query.event = event;
    query.locale = locale;

    const templates = await NotificationTemplate.find(query)
      .sort({ channel: 1, event: 1 })
      .lean();

    logRequest(
      "GET",
      "/api/admin/notification-templates",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(templates);
  } catch (error) {
    logger.error("Notification templates list failed", error as Error, {
      endpoint: "/api/admin/notification-templates",
    });
    logRequest(
      "GET",
      "/api/admin/notification-templates",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

/**
 * POST /api/admin/notification-templates - Create a new notification template
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    await initModels();
    const body = await request.json();

    const validatedData = createTemplateSchema.parse(body);

    // Validate subject is provided for email templates
    if (validatedData.channel === "email" && !validatedData.subject) {
      throw new ValidationError("Subject is required for email templates");
    }

    // Check if template already exists
    const existing = await NotificationTemplate.findOne({
      channel: validatedData.channel,
      event: validatedData.event,
      locale: validatedData.locale,
    });

    if (existing) {
      throw new ConflictError(
        "Template already exists for this channel, event, and locale"
      );
    }

    const template = new NotificationTemplate({
      ...validatedData,
      updatedBy: session.user.id,
    });

    await template.save();

    logRequest(
      "POST",
      "/api/admin/notification-templates",
      201,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(template.toObject(), {}, 201);
  } catch (error) {
    logger.error("Notification template creation failed", error as Error, {
      endpoint: "/api/admin/notification-templates",
    });
    logRequest(
      "POST",
      "/api/admin/notification-templates",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
