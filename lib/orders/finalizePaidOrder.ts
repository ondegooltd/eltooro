import mongoose from "mongoose";
import { Order, Product, User } from "@/lib/models";
import { initModels } from "@/lib/models/helpers";
import { verifyPayment } from "@/lib/payments/paystack";
import { logger } from "@/lib/logger";
import { addNotificationJob } from "@/lib/jobs/queue";

export type FinalizePaidSource = "webhook" | "verify";

export interface FinalizePaidResult {
  duplicate: boolean;
  orderId?: string;
  orderNumber?: string;
}

/**
 * Atomically confirm a paid order (Paystack reference), bump sales once, and
 * enqueue receipt notifications. Safe if verify + webhook both run.
 */
export async function finalizePaidOrderByReference(
  reference: string,
  source: FinalizePaidSource,
): Promise<FinalizePaidResult> {
  await initModels();

  const paymentData = await verifyPayment(reference);
  if (!paymentData?.status || paymentData.data?.status !== "success") {
    throw new Error("Paystack reports payment not successful");
  }

  const transactionId = String(paymentData.data.id ?? "");
  const paidAt = new Date();

  const updateResult = await Order.findOneAndUpdate(
    {
      "payment.reference": reference,
      "payment.status": { $nin: ["completed"] },
    },
    {
      $set: {
        status: "confirmed",
        "payment.status": "completed",
        "payment.transactionId": transactionId,
        "payment.paidAt": paidAt,
      },
      $push: {
        statusHistory: {
          status: "confirmed",
          timestamp: paidAt,
          note: `Payment confirmed via ${source}`,
        },
      },
    },
    { new: true },
  ).lean();

  if (!updateResult) {
    const existing = await Order.findOne({ "payment.reference": reference }).lean();
    if (existing?.payment?.status === "completed") {
      return {
        duplicate: true,
        orderId: existing._id?.toString(),
        orderNumber: existing.orderNumber,
      };
    }
    if (!existing) {
      logger.warn("finalizePaidOrder: no order for Paystack reference", { reference });
      return { duplicate: true };
    }
    return { duplicate: true };
  }

  const items = (updateResult.items || []) as Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  if (items.length > 0) {
    await Product.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { sales: item.quantity } },
        },
      })),
    );
  }

  try {
    const user = await User.findById(updateResult.userId).lean();
    if (user) {
      const userName = user.name
        ? `${user.name.first} ${user.name.last}`
        : `${updateResult.shipping?.firstName ?? ""}`.trim() || "Customer";

      const totalStr =
        updateResult.pricing?.total != null
          ? Number(updateResult.pricing.total).toFixed(2)
          : "0.00";
      const currency = updateResult.pricing?.currency ?? "GHS";

      await addNotificationJob(
        "payment_confirmation",
        {
          email: user.email,
          name: userName,
          orderNumber: updateResult.orderNumber,
          amount: totalStr,
          currency,
        },
        user.phone
          ? {
              phone: user.phone,
              name: userName,
              orderNumber: updateResult.orderNumber,
              amount: totalStr,
              currency,
            }
          : undefined,
      );

      await addNotificationJob(
        "order_confirmation",
        {
          email: user.email,
          name: userName,
          orderNumber: updateResult.orderNumber,
          orderTotal: totalStr,
          currency,
          itemCount: updateResult.items?.length ?? 0,
        },
        user.phone
          ? {
              phone: user.phone,
              name: userName,
              orderNumber: updateResult.orderNumber,
              orderTotal: totalStr,
              currency,
              itemCount: updateResult.items?.length ?? 0,
            }
          : undefined,
      );
    }
  } catch (notifyError) {
    logger.error("Paid order notifications failed", notifyError as Error, {
      reference,
      source,
      orderId: updateResult._id?.toString(),
    });
  }

  return {
    duplicate: false,
    orderId: updateResult._id?.toString(),
    orderNumber: updateResult.orderNumber,
  };
}
