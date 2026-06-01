import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/middleware";
import { ValidationError } from "@/lib/errors/api-error";
import { logger, logRequest } from "@/lib/logger";
import {
  SMSEventType,
  SMS_TEMPLATE_VARIABLES,
} from "@/lib/notifications/sms-templates";

/**
 * GET /api/admin/sms-templates/variables - Get available variables for event type
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType") as SMSEventType | null;

    if (eventType) {
      // Return variables for specific event type
      if (!Object.values(SMSEventType).includes(eventType)) {
        throw new ValidationError("Invalid event type");
      }

      const variables = SMS_TEMPLATE_VARIABLES[eventType];
      logRequest(
        "GET",
        "/api/admin/sms-templates/variables",
        200,
        Date.now() - startTime,
        session.user.id
      );
      return successResponse({
        eventType,
        variables,
      });
    }

    // Return all event types with their variables
    const allVariables = Object.entries(SMS_TEMPLATE_VARIABLES).map(
      ([eventType, variables]) => ({
        eventType,
        variables,
      })
    );

    logRequest(
      "GET",
      "/api/admin/sms-templates/variables",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(allVariables);
  } catch (error) {
    logger.error("SMS template variables fetch failed", error as Error, {
      endpoint: "/api/admin/sms-templates/variables",
    });
    logRequest(
      "GET",
      "/api/admin/sms-templates/variables",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
