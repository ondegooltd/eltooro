import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

/**
 * Validates critical env at process startup (instrumentation).
 * In production, missing `MONGODB_URI` or `NEXTAUTH_SECRET` fails fast.
 */
export function loadServerEnv(): void {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
    }
    console.warn("[env] Validation warnings:", msg);
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required in production");
    }
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error("NEXTAUTH_SECRET is required in production");
    }
  }
}
