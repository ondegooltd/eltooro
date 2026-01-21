import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, Product, User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { verifyPayment } from "@/lib/payments/paystack";
import { withPaymentRateLimit } from "@/lib/api/ratelimit-middleware";
import { logger, logRequest } from "@/lib/logger";
import { addNotificationJob } from "@/lib/jobs/queue";

const verifyPaymentSchema = z.object({
  reference: z.string(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Rate limiting
    const rateLimitResponse = await withPaymentRateLimit(request);
    if (rateLimitResponse) {
      logRequest("POST", "/api/payments/verify", 429, Date.now() - startTime);
      return rateLimitResponse;
    }
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = verifyPaymentSchema.parse(body);

    // Verify payment with Paystack
    const paymentData = await verifyPayment(validatedData.reference);

    if (!paymentData.status) {
      throw new ValidationError("Payment verification failed");
    }

    // Find order by reference
    const order = await Order.findOne({
      "payment.reference": validatedData.reference,
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Check if payment was successful
    if (paymentData.data.status === "success") {
      // Update order status
      order.status = "confirmed";
      order.payment.status = "completed";
      order.payment.transactionId = paymentData.data.id;
      order.payment.paidAt = new Date();
      order.statusHistory.push({
        status: "confirmed",
        timestamp: new Date(),
        note: "Payment verified successfully",
      });
      await order.save();

      // Update product sales count
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { sales: item.quantity },
        });
      }

      // Get user for notifications
      const user = await User.findById(order.userId).lean();

      // Send notifications via background jobs
      if (user) {
        await addNotificationJob(
          "payment_confirmation",
          {
            email: user.email,
            orderNumber: order.orderNumber,
            amount: order.pricing.total,
            currency: order.pricing.currency,
          },
          user.phone
            ? {
                phone: user.phone,
                orderNumber: order.orderNumber,
                amount: order.pricing.total,
                currency: order.pricing.currency,
                name: user.name
                  ? `${user.name.first} ${user.name.last}`
                  : order.shipping.firstName,
              }
            : undefined
        );

        await addNotificationJob(
          "order_confirmation",
          {
            email: user.email,
            orderNumber: order.orderNumber,
            orderTotal: order.pricing.total,
            currency: order.pricing.currency,
          },
          user.phone
            ? {
                phone: user.phone,
                orderNumber: order.orderNumber,
                name: user.name
                  ? `${user.name.first} ${user.name.last}`
                  : order.shipping.firstName,
                orderTotal: order.pricing.total,
                currency: order.pricing.currency,
                itemCount: order.items.length,
              }
            : undefined
        );
      }

      const response = successResponse({
        success: true,
        message: "Payment verified successfully",
        order: {
          _id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: "confirmed",
        },
      });

      logRequest(
        "POST",
        "/api/payments/verify",
        200,
        Date.now() - startTime,
        session.user.id
      );
      return response;
    } else {
      // Payment failed
      order.payment.status = "failed";
      await order.save();

      const response = successResponse({
        success: false,
        message: "Payment verification failed",
      });

      logRequest(
        "POST",
        "/api/payments/verify",
        200,
        Date.now() - startTime,
        session.user.id
      );
      return response;
    }
  } catch (error) {
    logger.error("Payment verification failed", error as Error, {
      endpoint: "/api/payments/verify",
    });
    logRequest(
      "POST",
      "/api/payments/verify",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
