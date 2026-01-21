import axios from "axios";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

export interface InitializePaymentData {
  email: string;
  amount: number; // in pesewas (kobo)
  reference: string;
  metadata?: Record<string, any>;
  phone?: string; // Mobile Money number
}

export async function initializePayment(data: InitializePaymentData) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const requestBody: any = {
    email: data.email,
    amount: data.amount * 100, // Convert to pesewas
    reference: data.reference,
    currency: "GHS",
    metadata: data.metadata,
    channels: ["mobile_money"], // Only Mobile Money for Ghana
  };

  // Add phone number if provided
  if (data.phone || data.metadata?.phone) {
    requestBody.mobile_money = {
      phone: data.phone || data.metadata.phone,
    };
  }

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    requestBody,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}

export async function verifyPayment(reference: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  return response.data;
}

export function verifyWebhookSignature(
  payload: string | object,
  signature: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    return false;
  }

  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(typeof payload === "string" ? payload : JSON.stringify(payload))
    .digest("hex");

  return hash === signature;
}
