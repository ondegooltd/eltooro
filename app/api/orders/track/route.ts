import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { NotFoundError, ValidationError } from "@/lib/errors/api-error";

export async function GET(request: NextRequest) {
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!orderNumber) {
      throw new ValidationError("Order number is required");
    }

    if (!email && !phone) {
      throw new ValidationError("Email or phone number is required");
    }

    const query: any = { orderNumber };

    // For guest orders, verify email or phone matches
    if (email) {
      query["shipping.phone"] = { $regex: email, $options: "i" };
    }
    if (phone) {
      query["shipping.phone"] = phone;
    }

    const order = await Order.findOne(query).lean();

    if (!order) {
      throw new NotFoundError("Order");
    }

    // Return only tracking information
    return successResponse({
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.shipping?.estimatedDelivery,
      deliveryTime: order.shipping?.deliveryTime,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
