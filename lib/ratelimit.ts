/**
 * Rate limiting: Upstash Redis when `UPSTASH_REDIS_REST_*` are set; otherwise an
 * in-process fallback (OK for single instance — not shared across servers).
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || "",
});

// Fallback: In-memory rate limiting if Redis is not available
class MemoryRateLimit {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(
    key: string,
    limit: number,
    window: string
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const windowMs = this.parseWindow(window);
    const resetAt = now + windowMs;

    const record = this.store.get(key);

    if (!record || record.resetAt < now) {
      // New window
      this.store.set(key, { count: 1, resetAt });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetAt,
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }

  private parseWindow(window: string): number {
    const match = window.match(/^(\d+)\s*([smhd])$/);
    if (!match) return 60000; // Default 1 minute

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60000;
    }
  }
}

// Use Redis if available, otherwise fallback to memory
const useRedis = !!(
  process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
);

// Authentication rate limit: 5 requests per 15 minutes
export const authRateLimit = useRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
    })
  : new MemoryRateLimit();

// Payment rate limit: 3 requests per minute
export const paymentRateLimit = useRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 m"),
      analytics: true,
    })
  : new MemoryRateLimit();

// Search rate limit: 30 requests per minute
export const searchRateLimit = useRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
    })
  : new MemoryRateLimit();

// General API rate limit: 100 requests per minute
export const generalRateLimit = useRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
    })
  : new MemoryRateLimit();

// OTP rate limit: 3 requests per hour
export const otpRateLimit = useRedis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
    })
  : new MemoryRateLimit();

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0] || realIp || "unknown";

  return ip;
}

/**
 * Check rate limit and return result
 */
export async function checkRateLimit(
  limiter: Ratelimit | MemoryRateLimit,
  identifier: string,
  limit?: number,
  window?: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (useRedis && limiter instanceof Ratelimit) {
    return await limiter.limit(identifier);
  } else if (limiter instanceof MemoryRateLimit) {
    // For memory rate limit, we need to specify limit and window
    const defaultLimit = limit || 100;
    const defaultWindow = window || "1 m";
    return await (limiter as any).limit(
      identifier,
      defaultLimit,
      defaultWindow
    );
  }

  return {
    success: true,
    limit: limit || 100,
    remaining: limit || 100,
    reset: Date.now() + 60000,
  };
}
