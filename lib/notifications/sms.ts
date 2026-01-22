// SMS notification service using MNotify

import axios from "axios";
import { logger } from "@/lib/logger";

interface SMSOptions {
  to: string;
  message: string;
}

/**
 * MNotify SMS Service Configuration
 */
class MnotifySmsService {
  private providerUrl: string;
  private authKey: string;
  private smsSenderId: string;
  private isConfigured: boolean;

  constructor() {
    const providerUrl =
      process.env.MNOTIFY_PROVIDER_URL ||
      "https://api.mnotify.com/api/sms/quick";
    const authKey = process.env.MNOTIFY_API_KEY;
    const smsSenderId = process.env.MNOTIFY_SMS_SENDER_ID;

    if (!providerUrl || !authKey || !smsSenderId) {
      logger.warn(
        "MNotify credentials are not configured. SMS service will be disabled.",
        {
          type: "sms_service_disabled",
        }
      );
      this.providerUrl = "";
      this.authKey = "";
      this.smsSenderId = "";
      this.isConfigured = false;
    } else {
      this.providerUrl = providerUrl;
      this.authKey = authKey;
      this.smsSenderId = smsSenderId;
      this.isConfigured = true;
    }
  }

  /**
   * Send SMS via MNotify
   */
  async send(
    recipient: string[],
    message: string,
    is_schedule: boolean = false,
    schedule_date: string = ""
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    status?: number;
  }> {
    if (!this.isConfigured) {
      logger.warn("MNotify not configured. Logging SMS to console.", {
        to: recipient,
        message,
      });
      console.log(
        `[MNotify SMS] To: ${recipient.join(", ")}, Message: ${message}`
      );
      return {
        success: false,
        message: "MNotify not configured",
        status: 400,
      };
    }

    const url = `${this.providerUrl}?key=${this.authKey}`;
    const payload = {
      recipient: recipient,
      sender: this.smsSenderId,
      message: message,
      is_schedule: is_schedule,
      schedule_date: schedule_date,
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if ((response.data as any).status === "success") {
        logger.info("SMS sent successfully via MNotify", {
          to: recipient,
          status: response.status,
        });
        return {
          success: true,
          message: "SMS sent successfully",
          status: 200,
        };
      } else {
        logger.error(
          "MNotify API returned error",
          new Error((response.data as any).message || "Unknown error"),
          {
            to: recipient,
            response: response.data,
          }
        );
        return {
          success: false,
          message: (response.data as any).message || "Failed to send SMS",
          error: (response.data as any).error,
          status: 400,
        };
      }
    } catch (error: any) {
      logger.error("Failed to send SMS via MNotify", error as Error, {
        to: recipient,
        type: "sms_error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        status: error.response?.status || 500,
      };
    }
  }

  /**
   * Send SMS to multiple recipients
   */
  async sendMany(
    recipient: string[],
    message: string,
    is_schedule: boolean = false,
    schedule_date: string = ""
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // MNotify supports multiple recipients in a single request
      return await this.send(recipient, message, is_schedule, schedule_date);
    } catch (err) {
      logger.error("Failed to send bulk SMS via MNotify", err as Error, {
        to: recipient,
        type: "sms_error",
      });

      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}

// Initialize MNotify service
const mnotifyService = new MnotifySmsService();

/**
 * Send SMS using MNotify
 */
export async function sendSMS(options: SMSOptions): Promise<void> {
  try {
    const result = await mnotifyService.send([options.to], options.message);

    if (!result.success) {
      throw new Error(result.error || result.message || "Failed to send SMS");
    }
  } catch (error) {
    logger.error("Failed to send SMS", error as Error, {
      to: options.to,
    });
    throw error;
  }
}

/**
 * Send order confirmation SMS
 * Uses unified notification template system
 */
export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  context?: {
    name?: string;
    orderTotal?: number;
    currency?: string;
    itemCount?: number;
  }
): Promise<void> {
  const { sendTemplatedSMS } = await import("./templated-notifications");

  await sendTemplatedSMS("order_confirmation", {
    phone,
    name: context?.name || "Customer",
    orderNumber,
    orderTotal: (context?.orderTotal || 0).toFixed(2),
    currency: context?.currency || "GHS",
    itemCount: context?.itemCount || 1,
  });
}

/**
 * Send payment confirmation SMS
 * Uses unified notification template system
 */
export async function sendPaymentConfirmationSMS(
  phone: string,
  orderNumber: string,
  amount: number,
  currency: string = "GHS",
  context?: { name?: string }
): Promise<void> {
  const { sendTemplatedSMS } = await import("./templated-notifications");

  await sendTemplatedSMS("payment_confirmation", {
    phone,
    name: context?.name || "Customer",
    orderNumber,
    amount: amount.toFixed(2),
    currency,
  });
}

/**
 * Send order shipped SMS
 * Uses unified notification template system
 */
export async function sendOrderShippedSMS(
  phone: string,
  orderNumber: string,
  trackingNumber?: string,
  context?: { name?: string; estimatedDelivery?: string }
): Promise<void> {
  const { sendTemplatedSMS } = await import("./templated-notifications");

  await sendTemplatedSMS("order_shipped", {
    phone,
    name: context?.name || "Customer",
    orderNumber,
    trackingNumber: trackingNumber || "",
    estimatedDelivery: context?.estimatedDelivery || "",
  });
}

/**
 * Send order delivered SMS
 * Uses unified notification template system
 */
export async function sendOrderDeliveredSMS(
  phone: string,
  orderNumber: string,
  context?: { name?: string }
): Promise<void> {
  const { sendTemplatedSMS } = await import("./templated-notifications");

  await sendTemplatedSMS("order_delivered", {
    phone,
    name: context?.name || "Customer",
    orderNumber,
  });
}

/**
 * Send OTP SMS
 * Uses unified notification template system
 */
export async function sendOTPSMS(
  phone: string,
  otp: string,
  context?: { name?: string; expiryMinutes?: number }
): Promise<void> {
  const { sendTemplatedSMS } = await import("./templated-notifications");

  await sendTemplatedSMS("otp", {
    phone,
    name: context?.name || "Customer",
    otp,
    expiryMinutes: context?.expiryMinutes || 10,
  });
}
