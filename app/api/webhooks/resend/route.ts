import { NextRequest } from "next/server";
import { Webhook } from "svix";
import { logger } from "@/lib/logger";

/**
 * Resend → Svix-signed webhooks for **delivery telemetry** (sent, delivered, bounced, complained).
 * Configure in Resend dashboard; set `RESEND_WEBHOOK_SECRET` to the signing secret.
 *
 * This does **not** replace outbound sending — it lets you log bounces and suppress bad addresses.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("RESEND_WEBHOOK_SECRET not set — accepting webhook without signature verify");
    const body = await request.json().catch(() => ({}));
    logger.info("Resend webhook (unsigned)", { type: body?.type ?? body?.event });
    return new Response("ok", { status: 200 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  try {
    const wh = new Webhook(secret);
    const evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type?: string; data?: Record<string, unknown> };

    logger.info("Resend webhook", {
      type: evt.type,
      emailId: (evt.data as { email_id?: string })?.email_id,
    });
  } catch (e) {
    logger.error("Resend webhook verify failed", e as Error);
    return new Response("Invalid signature", { status: 400 });
  }

  return new Response("ok", { status: 200 });
}
