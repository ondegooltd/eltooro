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
  renderSMSTemplate,
  validateTemplateLength,
} from "@/lib/notifications/sms-templates";

const previewSchema = z.object({
  variables: z.record(z.any()),
});

/**
 * POST /api/admin/sms-templates/[id]/preview - Preview template with sample data
 */
export async function POST(
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

    const template = await SMSTemplate.findById(id).lean();

    if (!template) {
      throw new NotFoundError("SMS template");
    }

    const validatedData = previewSchema.parse(body);

    // Render template with provided variables
    const rendered = renderSMSTemplate(
      template.message,
      validatedData.variables
    );

    // Validate length
    const lengthValidation = validateTemplateLength(rendered);

    logRequest(
      "POST",
      "/api/admin/sms-templates/[id]/preview",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse({
      rendered,
      length: lengthValidation.length,
      valid: lengthValidation.valid,
      exceeds: lengthValidation.exceeds,
    });
  } catch (error) {
    logger.error("SMS template preview failed", error as Error, {
      endpoint: "/api/admin/sms-templates/[id]/preview",
    });
    logRequest(
      "POST",
      "/api/admin/sms-templates/[id]/preview",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
