import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { verifyWebhookSignature } from "@/lib/payments/paystack";
import { logger } from "@/lib/logger";
import { finalizePaidOrderByReference } from "@/lib/orders/finalizePaidOrder";

export async function POST(request: NextRequest) {
  try {
    // HMAC must run on the bytes Paystack signed — read the raw body string
    // and verify before parsing.
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    await initModels();
    const event = body.event;

    if (event === "charge.success") {
      const reference = body.data?.reference as string | undefined;
      if (!reference) {
        return new Response("Missing reference", { status: 400 });
      }

      try {
        await finalizePaidOrderByReference(reference, "webhook");
      } catch (e) {
        logger.error("Webhook finalize payment failed", e as Error, { reference });
        return new Response("Processing error", { status: 500 });
      }
    } else if (event === "charge.failed") {
      const reference = body.data?.reference as string | undefined;
      if (!reference) {
        return successResponse({ received: true });
      }

      const order = await Order.findOne({
        "payment.reference": reference,
      });

      if (!order) {
        return successResponse({ received: true });
      }

      if (order.payment.status === "failed") {
        return successResponse({ received: true, duplicate: true });
      }

      if (order.payment.status === "completed") {
        logger.warn("charge.failed after completed payment — ignoring", { reference });
        return successResponse({ received: true, ignored: true });
      }

      order.payment.status = "failed";
      await order.save();

      if (order.items.length > 0) {
        await Product.bulkWrite(
          order.items.map((item: { productId: unknown; quantity: number }) => ({
            updateOne: {
              filter: { _id: item.productId },
              update: { $inc: { "stock.quantity": item.quantity } },
            },
          })),
        );
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    logger.error("Paystack webhook error", error as Error, {
      endpoint: "/api/payments/webhook",
    });
    return handleApiError(error);
  }
}
