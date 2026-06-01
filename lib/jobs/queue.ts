/**
 * Notification dispatch — **serverless-safe** (no Agenda / dedicated worker).
 *
 * Uses `after()` from Next.js so the HTTP response can finish while email/SMS
 * runs afterward in the same runtime (Vercel Fluid compute / Node server).
 *
 * **Resend webhooks** (see `/api/webhooks/resend`) are complementary: they tell you
 * *after* Resend accepted or bounced a message — they do not queue outbound mail.
 * For outbound without a worker, we send here and rely on Resend’s HTTP API + retries.
 *
 * In Jest, work runs synchronously (`await`) so tests stay deterministic.
 */
import { after } from "next/server";
import { logger } from "@/lib/logger";
import { initModels } from "@/lib/models/helpers";

const runSync =
  process.env.NODE_ENV === "test" || process.env.NOTIFICATIONS_SYNC === "1";

function scheduleWork(task: () => Promise<void>): void {
  const run = () =>
    task().catch((error) => {
      logger.error("Background notification task failed", error as Error);
    });

  if (runSync) {
    void run();
    return;
  }

  // Try to defer to after the response is sent (Vercel Fluid / Node server).
  // `after()` must be called synchronously while the request context is still
  // active — a dynamic import would introduce a microtask gap that races with
  // the response, so we import statically. If we are outside a request scope
  // (scripts, init code) `after()` throws and we just run inline.
  try {
    after(() => {
      void run();
    });
  } catch {
    void run();
  }
}

async function runEmailJob(event: string, data: Record<string, unknown>): Promise<void> {
  await initModels();
  const { sendTemplatedEmail } = await import("@/lib/notifications/templated-notifications");
  await sendTemplatedEmail(event, data as Record<string, any>);
}

async function runSmsJob(event: string, data: Record<string, unknown>): Promise<void> {
  await initModels();
  const { sendTemplatedSMS } = await import("@/lib/notifications/templated-notifications");
  await sendTemplatedSMS(event, data as Record<string, any>);
}

export async function addEmailJob(
  event: string,
  data: Record<string, unknown>,
  options?: { delay?: number; attempts?: number },
): Promise<void> {
  const delayMs = options?.delay ?? 0;

  const execute = async () => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    await runEmailJob(event, data);
  };

  if (runSync) {
    await execute();
    return;
  }

  scheduleWork(execute);
}

export async function addSMSJob(
  event: string,
  data: Record<string, unknown>,
  options?: { delay?: number; attempts?: number },
): Promise<void> {
  const delayMs = options?.delay ?? 0;

  const execute = async () => {
    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
    await runSmsJob(event, data);
  };

  if (runSync) {
    await execute();
    return;
  }

  scheduleWork(execute);
}

export async function addNotificationJob(
  event: string,
  emailData?: Record<string, unknown>,
  smsData?: Record<string, unknown>,
  options?: { delay?: number; attempts?: number },
): Promise<void> {
  if (runSync) {
    if (emailData) await addEmailJob(event, emailData, options);
    if (smsData) await addSMSJob(event, smsData, options);
    return;
  }

  if (emailData) {
    void addEmailJob(event, emailData, options);
  }
  if (smsData) {
    void addSMSJob(event, smsData, options);
  }
}

/** No-op stubs for legacy callers / scripts */
export async function initAgenda(): Promise<void> {
  logger.info("initAgenda: no-op (notifications use after() + direct send)");
}

export async function shutdownAgenda(): Promise<void> {
  logger.info("shutdownAgenda: no-op");
}
