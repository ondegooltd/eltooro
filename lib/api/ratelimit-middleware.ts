import { NextRequest, NextResponse } from "next/server";
import {
  authRateLimit,
  paymentRateLimit,
  searchRateLimit,
  generalRateLimit,
  otpRateLimit,
  getRateLimitIdentifier,
  checkRateLimit,
} from "@/lib/ratelimit";
import { errorResponse } from "@/lib/api/response";
import { ApiError } from "@/lib/errors/api-error";

/**
 * Rate limit middleware factory
 */
export function withRateLimit(limiter: any, options?: { message?: string }) {
  return async (request: NextRequest) => {
    try {
      const identifier = getRateLimitIdentifier(request);
      // For memory rate limit, we need to provide limit and window
      // This is handled internally by the limiter
      const result = await checkRateLimit(limiter, identifier);

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "RATE_LIMIT_EXCEEDED",
              message:
                options?.message ||
                "Too many requests. Please try again later.",
            },
            meta: {
              timestamp: new Date().toISOString(),
              rateLimit: {
                limit: result.limit,
                remaining: result.remaining,
                reset: new Date(result.reset).toISOString(),
              },
            },
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": result.limit.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": result.reset.toString(),
            },
          }
        );
      }

      return null; // Continue to next handler
    } catch (error) {
      // If rate limiting fails, allow the request (fail open)
      console.error("Rate limit check failed:", error);
      return null;
    }
  };
}

/**
 * Auth rate limit middleware
 */
export const withAuthRateLimit = withRateLimit(authRateLimit, {
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

/**
 * Payment rate limit middleware
 */
export const withPaymentRateLimit = withRateLimit(paymentRateLimit, {
  message: "Too many payment requests. Please try again in a minute.",
});

/**
 * Search rate limit middleware
 */
export const withSearchRateLimit = withRateLimit(searchRateLimit, {
  message: "Too many search requests. Please try again in a minute.",
});

/**
 * OTP rate limit middleware
 */
export const withOTPRateLimit = withRateLimit(otpRateLimit, {
  message: "Too many OTP requests. Please try again in an hour.",
});

/**
 * General API rate limit middleware
 */
export const withGeneralRateLimit = withRateLimit(generalRateLimit);
