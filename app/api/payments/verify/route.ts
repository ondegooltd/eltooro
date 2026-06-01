import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { NotFoundError, ValidationError, ForbiddenError } from "@/lib/errors/api-error";
import { z } from "zod";
import { withPaymentRateLimit } from "@/lib/api/ratelimit-middleware";
import { logger, logRequest } from "@/lib/logger";
import { finalizePaidOrderByReference } from "@/lib/orders/finalizePaidOrder";

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const rateLimitResponse = await withPaymentRateLimit(request);
    if (rateLimitResponse) {
      logRequest("POST", "/api/payments/verify", 429, Date.now() - startTime);
      return rateLimitResponse;
    }
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = verifyPaymentSchema.parse(body);

    const order = await Order.findOne({
      "payment.reference": validatedData.reference,
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.userId.toString() !== session.user.id) {
      throw new ForbiddenError("You cannot verify payment for this order");
    }

    let finalizeResult;
    try {
      finalizeResult = await finalizePaidOrderByReference(validatedData.reference, "verify");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("not successful")) {
        order.payment.status = "failed";
        await order.save();
        const response = successResponse({
          success: false,
          message: "Payment verification failed",
        });
        logRequest("POST", "/api/payments/verify", 200, Date.now() - startTime, session.user.id);
        return response;
      }
      throw e;
    }

    const latest = await Order.findOne({
      "payment.reference": validatedData.reference,
    }).lean();

    const response = successResponse({
      success: true,
      message: finalizeResult.duplicate
        ? "Payment already confirmed"
        : "Payment verified successfully",
      order: {
        _id: String(finalizeResult.orderId ?? latest?._id ?? order._id),
        orderNumber: finalizeResult.orderNumber || latest?.orderNumber || order.orderNumber,
        status: latest?.status ?? "confirmed",
        duplicate: finalizeResult.duplicate,
      },
    });

    logRequest("POST", "/api/payments/verify", 200, Date.now() - startTime, session.user.id);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleApiError(new ValidationError(error.message));
    }
    logger.error("Payment verification failed", error as Error, {
      endpoint: "/api/payments/verify",
    });
    logRequest(
      "POST",
      "/api/payments/verify",
      (error as { statusCode?: number }).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}
