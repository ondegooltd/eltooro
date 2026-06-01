import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError, NotFoundError } from "@/lib/errors/api-error";
import { z } from "zod";
import crypto from "crypto";
import { addEmailJob } from "@/lib/jobs/queue";
import { logger, logRequest } from "@/lib/logger";

const requestResetSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/auth/password-reset/request - Request password reset
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const body = await request.json();

    const validatedData = requestResetSchema.parse(body);

    // Find user
    const user = await User.findOne({
      email: validatedData.email.toLowerCase(),
    });

    if (!user) {
      // Don't reveal if user exists for security
      logRequest(
        "POST",
        "/api/auth/password-reset/request",
        200,
        Date.now() - startTime,
      );
      return successResponse({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate reset token. The raw token is mailed to the user; only the
    // SHA-256 hash is persisted, so a DB read leak doesn't yield usable
    // reset links. The reset endpoint hashes the incoming token before
    // lookup.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    (user as any).passwordResetToken = resetTokenHash;
    (user as any).passwordResetExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetLink = `${
      process.env.NEXT_PUBLIC_APP_URL
    }/reset-password?token=${resetToken}`;
    const userName = user.name
      ? `${user.name.first} ${user.name.last}`
      : "Customer";
    await addEmailJob("password_reset", {
      email: validatedData.email,
      name: userName,
      resetLink,
    });

    logRequest(
      "POST",
      "/api/auth/password-reset/request",
      200,
      Date.now() - startTime,
    );
    return successResponse({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    logger.error("Password reset request failed", error as Error, {
      endpoint: "/api/auth/password-reset/request",
    });
    logRequest(
      "POST",
      "/api/auth/password-reset/request",
      (error as any).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}
