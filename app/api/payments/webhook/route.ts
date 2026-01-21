import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { Order, Product } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { verifyWebhookSignature, verifyPayment } from "@/lib/payments/paystack";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      return new Response("Invalid signature", { status: 401 });
    }

    await initModels();
    const event = body.event;

    // Handle different webhook events
    if (event === "charge.success") {
      const reference = body.data.reference;

      // Verify payment with Paystack
      const paymentData = await verifyPayment(reference);

      // Find order by reference
      const order = await Order.findOne({
        "payment.reference": reference,
      });

      if (order && paymentData.data.status === "success") {
        // Update order status
        order.status = "confirmed";
        order.payment.status = "completed";
        order.payment.transactionId = paymentData.data.id;
        order.payment.paidAt = new Date();
        order.statusHistory.push({
          status: "confirmed",
          timestamp: new Date(),
          note: "Payment confirmed via webhook",
        });
        await order.save();

        // Update product sales count
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { sales: item.quantity },
          });
        }

        // TODO: Send confirmation email/SMS
      }
    } else if (event === "charge.failed") {
      const reference = body.data.reference;

      const order = await Order.findOne({
        "payment.reference": reference,
      });

      if (order) {
        order.payment.status = "failed";
        await order.save();

        // Release stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { "stock.quantity": item.quantity },
          });
        }
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return handleApiError(error);
  }
}
