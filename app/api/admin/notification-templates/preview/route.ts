import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/middleware";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { renderTemplate } from "@/lib/notifications/template-renderer";
import { z } from "zod";
import { logger, logRequest } from "@/lib/logger";

const previewSchema = z.object({
  template: z.string().min(1, "Template is required"),
  data: z.record(z.any()),
  subject: z.string().optional(),
});

/**
 * POST /api/admin/notification-templates/preview - Preview a rendered template
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    const body = await request.json();

    const validatedData = previewSchema.parse(body);

    // Render template
    const renderedBody = renderTemplate(validatedData.template, validatedData.data);
    const renderedSubject = validatedData.subject
      ? renderTemplate(validatedData.subject, validatedData.data)
      : null;

    logRequest(
      "POST",
      "/api/admin/notification-templates/preview",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({
      rendered: {
        subject: renderedSubject,
        body: renderedBody,
      },
    });
  } catch (error) {
    logger.error("Template preview failed", error as Error, {
      endpoint: "/api/admin/notification-templates/preview",
    });
    logRequest(
      "POST",
      "/api/admin/notification-templates/preview",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
