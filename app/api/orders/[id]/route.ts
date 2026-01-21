import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors/api-error";
import mongoose from "mongoose";
import { logger, logRequest } from "@/lib/logger";
import { addNotificationJob } from "@/lib/jobs/queue";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid order ID format");
    }

    const order = await Order.findById(id).lean();

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Check if user owns this order or is admin
    if (
      order.userId.toString() !== session.user.id &&
      (session.user as any).role !== "admin"
    ) {
      throw new ForbiddenError("You don't have access to this order");
    }

    logRequest(
      "GET",
      "/api/orders/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(order);
  } catch (error) {
    logger.error("Order detail failed", error as Error, {
      endpoint: "/api/orders/[id]",
    });
    logRequest(
      "GET",
      "/api/orders/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid order ID format");
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Only admin can update orders
    if ((session.user as any).role !== "admin") {
      throw new ForbiddenError("Only admins can update orders");
    }

    // Update order status
    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (body.status && !allowedStatuses.includes(body.status)) {
      throw new ValidationError("Invalid order status");
    }

    if (body.status) {
      order.status = body.status as any;
      order.statusHistory.push({
        status: body.status,
        timestamp: new Date(),
        note: body.note,
      });
    }

    if (body.trackingNumber) {
      order.trackingNumber = body.trackingNumber;
    }

    if (body.notes) {
      order.notes = body.notes;
    }

    await order.save();

    const updatedOrder = order.toObject();

    // Send notifications for status changes
    if (body.status && updatedOrder) {
      const { User } = await import("@/lib/models");
      const user = await User.findById(order.userId).lean();

      if (user) {
        if (body.status === "shipped") {
          await addNotificationJob(
            "order_shipped",
            {
              email: user.email,
              orderNumber: order.orderNumber,
              trackingNumber: body.trackingNumber,
            },
            user.phone
              ? {
                  phone: user.phone,
                  orderNumber: order.orderNumber,
                  trackingNumber: body.trackingNumber,
                  name: user.name
                    ? `${user.name.first} ${user.name.last}`
                    : order.shipping.firstName,
                  estimatedDelivery: order.shipping.estimatedDelivery
                    ? new Date(
                        order.shipping.estimatedDelivery
                      ).toLocaleDateString()
                    : "",
                }
              : undefined
          );
        } else if (body.status === "delivered") {
          await addNotificationJob(
            "order_delivered",
            {
              email: user.email,
              orderNumber: order.orderNumber,
            },
            user.phone
              ? {
                  phone: user.phone,
                  orderNumber: order.orderNumber,
                  name: user.name
                    ? `${user.name.first} ${user.name.last}`
                    : order.shipping.firstName,
                }
              : undefined
          );
        }
      }
    }

    logRequest(
      "PUT",
      "/api/orders/[id]",
      200,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(updatedOrder);
  } catch (error) {
    logger.error("Order update failed", error as Error, {
      endpoint: "/api/orders/[id]",
    });
    logRequest(
      "PUT",
      "/api/orders/[id]",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
