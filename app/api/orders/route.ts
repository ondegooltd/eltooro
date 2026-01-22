import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, Product, User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/middleware";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";
import mongoose from "mongoose";
import { generateOrderNumber } from "@/lib/orders/generateOrderNumber";
import {
  calculateServiceFee,
  calculateDeliveryFee,
  calculateDeliveryTime,
} from "@/lib/orders/calculations";
import { logger, logRequest } from "@/lib/logger";
import { addNotificationJob } from "@/lib/jobs/queue";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
      price: z.number(),
    })
  ),
  shipping: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    apartment: z.string().optional(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string().optional(),
    phone: z.string(),
  }),
  billing: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address: z.string(),
    city: z.string(),
    region: z.string(),
    postalCode: z.string().optional(),
  }),
  paymentMethod: z.enum(["momo", "card", "paystack"]),
  currency: z.enum(["GHS", "USD"]).default("GHS"),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await requireAuth(request);
    await initModels();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({
        userId: session.user.id,
      }),
    ]);

    return successResponse(orders, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const stockReservations: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }> = [];

  try {
    const session = await requireAuth(request);
    await initModels();
    const body = await request.json();

    const validatedData = createOrderSchema.parse(body);

    // Validate products and check stock
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    }).lean();

    if (products.length !== validatedData.items.length) {
      throw new NotFoundError("One or more products not found");
    }

    // Check stock and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of validatedData.items) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        throw new NotFoundError(`Product ${item.productId}`);
      }

      if (!product.stock?.inStock || product.stock.quantity < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }

      // Reserve stock (decrement quantity)
      const updateResult = await Product.findByIdAndUpdate(
        product._id,
        { $inc: { "stock.quantity": -item.quantity } },
        { new: true }
      );

      if (!updateResult) {
        throw new ValidationError(
          `Failed to reserve stock for ${product.name}`
        );
      }

      // Track reservation for potential rollback
      stockReservations.push({
        productId: product._id,
        quantity: item.quantity,
      });

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images?.[0]?.url || "",
        price: item.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Calculate fees
    const isInternational = validatedData.currency === "USD";
    const serviceFee = 0; // No service fee charged
    const deliveryFee = await calculateDeliveryFee(
      validatedData.shipping.city,
      isInternational
    );
    const { estimatedDelivery, deliveryTime } = await calculateDeliveryTime(
      validatedData.shipping.city,
      isInternational
    );

    const total = subtotal + serviceFee + deliveryFee;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      userId: session.user.id,
      items: orderItems,
      pricing: {
        subtotal,
        serviceFee,
        deliveryFee,
        total,
        currency: validatedData.currency,
      },
      shipping: {
        ...validatedData.shipping,
        deliveryLocation: validatedData.shipping.city,
        estimatedDelivery,
        deliveryTime,
      },
      billing: validatedData.billing,
      payment: {
        method: validatedData.paymentMethod,
        provider: "paystack",
        reference: `REF-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        status: "pending",
        amount: total,
      },
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Send order confirmation notification via background job
    const user = await User.findById(session.user.id).lean();

    if (user) {
      const { addNotificationJob } = await import("@/lib/jobs/queue");
      const userName = user.name
        ? `${user.name.first} ${user.name.last}`
        : order.shipping.firstName || "Customer";
      
      await addNotificationJob(
        "order_confirmation",
        {
          email: user.email || order.shipping.email,
          name: userName,
          orderNumber: order.orderNumber,
          orderTotal: order.pricing.total.toFixed(2),
          currency: order.pricing.currency,
          itemCount: order.items.length,
        },
        user.phone || order.shipping.phone
          ? {
              phone: user.phone || order.shipping.phone,
              name: userName,
              orderNumber: order.orderNumber,
              orderTotal: order.pricing.total.toFixed(2),
              currency: order.pricing.currency,
              itemCount: order.items.length,
            }
          : undefined
      );
    }

    logRequest(
      "POST",
      "/api/orders",
      201,
      Date.now() - startTime,
      session.user.id
    );
    return successResponse(order.toObject(), {}, 201);
  } catch (error) {
    // Rollback stock reservations if order creation failed
    if (stockReservations.length > 0) {
      try {
        for (const reservation of stockReservations) {
          await Product.findByIdAndUpdate(reservation.productId, {
            $inc: { "stock.quantity": reservation.quantity },
          });
        }
      } catch (rollbackError) {
        logger.error(
          "Failed to rollback stock reservations",
          rollbackError as Error,
          {
            endpoint: "/api/orders",
            reservations: stockReservations,
          }
        );
      }
    }

    logger.error("Order creation failed", error as Error, {
      endpoint: "/api/orders",
    });
    logRequest(
      "POST",
      "/api/orders",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
