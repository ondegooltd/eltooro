import { NextRequest } from "next/server";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import { generateOTP, storeOTP } from "@/lib/auth/otp";
import { addEmailJob, addSMSJob } from "@/lib/jobs/queue";
import { logger, logRequest } from "@/lib/logger";

const sendOTPSchema = z.object({
  identifier: z.string().min(1), // email or phone
  type: z.enum(["email", "phone"]),
});

/**
 * POST /api/auth/otp/send - Send OTP for verification
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const validatedData = sendOTPSchema.parse(body);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database
    await storeOTP(validatedData.identifier, otp, validatedData.type);

    // Send OTP via email or SMS
    if (validatedData.type === "email") {
      await addEmailJob("otp", {
        email: validatedData.identifier,
        otp,
        expiryMinutes: 10,
      });
    } else {
      await addSMSJob("otp", {
        phone: validatedData.identifier,
        otp,
        expiryMinutes: 10,
      });
    }

    logRequest("POST", "/api/auth/otp/send", 200, Date.now() - startTime);
    return successResponse({
      message: "OTP sent successfully",
    });
  } catch (error) {
    logger.error("OTP send failed", error as Error, {
      endpoint: "/api/auth/otp/send",
    });
    logRequest(
      "POST",
      "/api/auth/otp/send",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
