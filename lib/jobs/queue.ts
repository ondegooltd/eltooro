import { Queue, Worker, QueueEvents, ConnectionOptions } from "bullmq";

// Initialize Redis connection for BullMQ
// Note: BullMQ requires a full Redis connection (not REST API)
// For Upstash, use a Redis client like ioredis or node-redis
const getRedisConnection = (): ConnectionOptions => {
  if (process.env.REDIS_HOST) {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379"),
      ...(process.env.REDIS_PASSWORD && {
        password: process.env.REDIS_PASSWORD,
      }),
    };
  }

  // Default to localhost for development
  // In production, ensure REDIS_HOST is set
  return {
    host: "localhost",
    port: 6379,
  };
};

const redisConnection: ConnectionOptions = getRedisConnection();

/**
 * Email Queue
 */
export const emailQueue = new Queue("email", {
  connection: redisConnection,
});

/**
 * SMS Queue
 */
export const smsQueue = new Queue("sms", {
  connection: redisConnection,
});

/**
 * Notification Queue
 */
export const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});

/**
 * Order Processing Queue
 */
export const orderQueue = new Queue("orders", {
  connection: redisConnection,
});

/**
 * Email Worker
 */
export const emailWorker = new Worker(
  "email",
  async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case "order_confirmation":
        const { sendOrderConfirmationEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendOrderConfirmationEmail(
          data.email,
          data.orderNumber,
          data.orderTotal,
          data.currency
        );
        break;
      case "payment_confirmation":
        const { sendPaymentConfirmationEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendPaymentConfirmationEmail(
          data.email,
          data.orderNumber,
          data.amount,
          data.currency
        );
        break;
      case "order_shipped":
        const { sendOrderShippedEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendOrderShippedEmail(
          data.email,
          data.orderNumber,
          data.trackingNumber
        );
        break;
      case "order_delivered":
        const { sendOrderDeliveredEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendOrderDeliveredEmail(data.email, data.orderNumber);
        break;
      case "otp":
        const { sendOTPEmail } = await import("@/lib/notifications/email");
        await sendOTPEmail(data.email, data.otp);
        break;
      case "support_ticket_created":
        const { sendSupportTicketConfirmationEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendSupportTicketConfirmationEmail(
          data.email,
          data.ticketNumber,
          data.firstName,
          data.subject
        );
        break;
      case "support_ticket_status_update":
        const { sendSupportTicketStatusUpdateEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendSupportTicketStatusUpdateEmail(
          data.email,
          data.ticketNumber,
          data.status,
          data.firstName
        );
        break;
      case "support_ticket_response":
        const { sendSupportTicketResponseEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendSupportTicketResponseEmail(
          data.email,
          data.ticketNumber,
          data.message,
          data.isFromAdmin,
          data.firstName
        );
        break;
      case "admin_ticket_notification":
        const { sendAdminTicketNotificationEmail } = await import(
          "@/lib/notifications/email"
        );
        await sendAdminTicketNotificationEmail(
          data.email,
          data.ticketNumber,
          data.subject,
          data.priority,
          data.customerEmail
        );
        break;
      default:
        console.error(`Unknown email type: ${type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

/**
 * SMS Worker
 */
export const smsWorker = new Worker(
  "sms",
  async (job) => {
    const { type, data } = job.data;

    switch (type) {
      case "order_confirmation":
        const { sendOrderConfirmationSMS } = await import(
          "@/lib/notifications/sms"
        );
        await sendOrderConfirmationSMS(data.phone, data.orderNumber, {
          name: data.name,
          orderTotal: data.orderTotal,
          currency: data.currency,
          itemCount: data.itemCount,
        });
        break;
      case "payment_confirmation":
        const { sendPaymentConfirmationSMS } = await import(
          "@/lib/notifications/sms"
        );
        await sendPaymentConfirmationSMS(
          data.phone,
          data.orderNumber,
          data.amount,
          data.currency,
          { name: data.name }
        );
        break;
      case "order_shipped":
        const { sendOrderShippedSMS } = await import("@/lib/notifications/sms");
        await sendOrderShippedSMS(
          data.phone,
          data.orderNumber,
          data.trackingNumber,
          { name: data.name, estimatedDelivery: data.estimatedDelivery }
        );
        break;
      case "order_delivered":
        const { sendOrderDeliveredSMS } = await import(
          "@/lib/notifications/sms"
        );
        await sendOrderDeliveredSMS(data.phone, data.orderNumber, {
          name: data.name,
        });
        break;
      case "otp":
        const { sendOTPSMS } = await import("@/lib/notifications/sms");
        await sendOTPSMS(data.phone, data.otp, {
          name: data.name,
          expiryMinutes: data.expiryMinutes,
        });
        break;
      default:
        console.error(`Unknown SMS type: ${type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

/**
 * Queue event listeners for monitoring
 */
if (emailWorker) {
  emailWorker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
  });
}

if (smsWorker) {
  smsWorker.on("completed", (job) => {
    console.log(`SMS job ${job.id} completed`);
  });

  smsWorker.on("failed", (job, err) => {
    console.error(`SMS job ${job?.id} failed:`, err);
  });
}

/**
 * Add email job to queue
 */
export async function addEmailJob(
  type: string,
  data: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  await emailQueue.add(type, { type, data }, options);
}

/**
 * Add SMS job to queue
 */
export async function addSMSJob(
  type: string,
  data: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  await smsQueue.add(type, { type, data }, options);
}

/**
 * Add notification job (both email and SMS)
 */
export async function addNotificationJob(
  type: string,
  emailData?: any,
  smsData?: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  if (emailData) {
    await addEmailJob(type, emailData, options);
  }
  if (smsData) {
    await addSMSJob(type, smsData, options);
  }
}
