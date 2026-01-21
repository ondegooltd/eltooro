import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { initializePayment } from "@/lib/payments/paystack";
import { withPaymentRateLimit } from "@/lib/api/ratelimit-middleware";
import { logger, logRequest } from "@/lib/logger";

const initializePaymentSchema = z.object({
  orderId: z.string(),
  phone: z.string().optional(), // Mobile Money number
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Rate limiting
    const rateLimitResponse = await withPaymentRateLimit(request);
    if (rateLimitResponse) {
      logRequest(
        "POST",
        "/api/payments/initialize",
        429,
        Date.now() - startTime
      );
      return rateLimitResponse;
    }
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = initializePaymentSchema.parse(body);

    if (!mongoose.Types.ObjectId.isValid(validatedData.orderId)) {
      throw new ValidationError("Invalid order ID");
    }

    const order = await Order.findOne({
      _id: validatedData.orderId,
      userId: session.user.id,
    }).lean();

    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.status !== "pending") {
      throw new ValidationError("Order is not in pending status");
    }

    // Get user email
    const user = await User.findById(session.user.id).lean();

    if (!user || !user.email) {
      throw new ValidationError("User email not found");
    }

    // Initialize payment with Paystack
    const phone = validatedData.phone || user.phone || order.shipping.phone;

    const paymentData = await initializePayment({
      email: user.email,
      amount: order.pricing.total,
      reference: order.payment.reference,
      phone: phone,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: session.user.id,
        phone: phone,
      },
    });

    // Update order with payment initialization
    await Order.findByIdAndUpdate(order._id, {
      $set: {
        "payment.status": "processing",
        updatedAt: new Date(),
      },
    });

    const response = successResponse({
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
      reference: order.payment.reference,
    });

    logRequest(
      "POST",
      "/api/payments/initialize",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return response;
  } catch (error) {
    logger.error("Payment initialization failed", error as Error, {
      endpoint: "/api/payments/initialize",
    });
    logRequest(
      "POST",
      "/api/payments/initialize",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
