import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors/api-error";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth(request);
    await initModels();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid order ID format");
    }

    const order = await Order.findById(id);

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Check if user owns this order
    if (order.userId.toString() !== session.user.id) {
      throw new ForbiddenError("You can only cancel your own orders");
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new ValidationError(
        "Order cannot be cancelled in its current status"
      );
    }

    // Start Mongoose transaction to release stock and cancel order
    const mongooseSession = await mongoose.startSession();

    try {
      await mongooseSession.withTransaction(async () => {
        // Release stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { "stock.quantity": item.quantity } },
            { session: mongooseSession }
          );
        }

        // Update order status
        order.status = "cancelled";
        order.statusHistory.push({
          status: "cancelled",
          timestamp: new Date(),
          note: "Cancelled by user",
        });
        await order.save({ session: mongooseSession });
      });
    } finally {
      await mongooseSession.endSession();
    }

    return successResponse({ message: "Order cancelled successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
