import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import { verifyOTP } from "@/lib/auth/otp";
import { logger, logRequest } from "@/lib/logger";
import { normalizePhoneNumber } from "@/lib/utils/phone";

const verifyOTPSchema = z.object({
  identifier: z.string().min(1), // email or phone
  otp: z.string().length(6),
  type: z.enum(["email", "phone"]).optional(), // Optional, will be inferred if not provided
});

/**
 * POST /api/auth/otp/verify - Verify OTP
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const validatedData = verifyOTPSchema.parse(body);

    // Infer type from identifier if not provided
    const type =
      validatedData.type ||
      (validatedData.identifier.includes("@") ? "email" : "phone");

    const isValid = await verifyOTP(
      validatedData.identifier,
      validatedData.otp,
      type
    );

    if (!isValid) {
      throw new ValidationError("Invalid or expired OTP");
    }

    // Update user verification status
    await initModels();
    const identifier = validatedData.identifier;
    const isEmail = identifier.includes("@");

    if (isEmail) {
      const user = await User.findOne({ email: identifier.toLowerCase() });
      if (user) {
        user.emailVerified = true;
        await user.save();
      }
    } else {
      const normalizedPhone = normalizePhoneNumber(identifier);
      const user = await User.findOne({ phone: normalizedPhone });
      if (user) {
        user.phoneVerified = true;
        await user.save();
      }
    }

    logRequest("POST", "/api/auth/otp/verify", 200, Date.now() - startTime);
    return successResponse({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    logger.error("OTP verification failed", error as Error, {
      endpoint: "/api/auth/otp/verify",
    });
    logRequest(
      "POST",
      "/api/auth/otp/verify",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
