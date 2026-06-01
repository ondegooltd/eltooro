import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { logger, logRequest } from "@/lib/logger";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

/**
 * POST /api/auth/password-reset/reset - Reset password with token
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const body = await request.json();

    const validatedData = resetPasswordSchema.parse(body);

    // Tokens are stored hashed (SHA-256). Hash the incoming token before
    // looking it up so a DB leak does not expose usable reset links.
    const tokenHash = crypto
      .createHash("sha256")
      .update(validatedData.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpiry: { $gt: new Date() },
    } as any);

    if (!user) {
      throw new ValidationError("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Update password and clear reset token in one atomic update
    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword },
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
    });

    logRequest(
      "POST",
      "/api/auth/password-reset/reset",
      200,
      Date.now() - startTime
    );
    return successResponse({
      message: "Password reset successfully",
    });
  } catch (error) {
    logger.error("Password reset failed", error as Error, {
      endpoint: "/api/auth/password-reset/reset",
    });
    logRequest(
      "POST",
      "/api/auth/password-reset/reset",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
