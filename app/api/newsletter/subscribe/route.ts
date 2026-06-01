import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { NewsletterSubscription } from "@/lib/models/newsletter";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError, ConflictError } from "@/lib/errors/api-error";
import { logger, logRequest } from "@/lib/logger";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const body = await request.json();

    const validatedData = subscribeSchema.parse(body);
    const email = validatedData.email.toLowerCase().trim();

    // Check if email already exists
    const existing = await NewsletterSubscription.findOne({ email });

    if (existing) {
      if (existing.status === "active") {
        logRequest(
          "POST",
          "/api/newsletter/subscribe",
          200,
          Date.now() - startTime
        );
        return successResponse(
          { message: "You are already subscribed to our newsletter" },
          {},
          200
        );
      } else {
        // Re-subscribe if previously unsubscribed
        existing.status = "active";
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        if (validatedData.source) {
          existing.source = validatedData.source;
        }
        await existing.save();
        logRequest(
          "POST",
          "/api/newsletter/subscribe",
          200,
          Date.now() - startTime
        );
        return successResponse(
          { message: "Successfully re-subscribed to our newsletter" },
          {},
          200
        );
      }
    }

    // Create new subscription
    const subscription = new NewsletterSubscription({
      email,
      status: "active",
      source: validatedData.source || "footer",
    });

    await subscription.save();

    logRequest(
      "POST",
      "/api/newsletter/subscribe",
      201,
      Date.now() - startTime
    );
    return successResponse(
      { message: "Successfully subscribed to our newsletter" },
      {},
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationError = new ValidationError(
        error.errors.map((e) => e.message).join(", ")
      );
      logRequest(
        "POST",
        "/api/newsletter/subscribe",
        validationError.statusCode,
        Date.now() - startTime
      );
      return handleApiError(validationError);
    }

    logger.error("Newsletter subscription failed", error as Error, {
      endpoint: "/api/newsletter/subscribe",
    });
    logRequest(
      "POST",
      "/api/newsletter/subscribe",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
