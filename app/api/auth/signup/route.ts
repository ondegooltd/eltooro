import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { User } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/api-error";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import { logger, logRequest } from "@/lib/logger";
import mongoose from "mongoose";

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

/**
 * POST /api/auth/signup - Create new user account
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const body = await request.json();

    const validatedData = signupSchema.parse(body);

    // Must have either email or phone
    if (!validatedData.email && !validatedData.phone) {
      throw new ValidationError("Either email or phone number is required");
    }

    // Check if user already exists
    const query: any = {
      $or: [
        ...(validatedData.email
          ? [{ email: validatedData.email.toLowerCase() }]
          : []),
        ...(validatedData.phone
          ? [{ phone: normalizePhoneNumber(validatedData.phone) }]
          : []),
      ],
    };

    const existingUser = await User.findOne(query);

    if (existingUser) {
      if (existingUser.email === validatedData.email?.toLowerCase()) {
        throw new ValidationError("Email already registered");
      }
      if (
        existingUser.phone === normalizePhoneNumber(validatedData.phone || "")
      ) {
        throw new ValidationError("Phone number already registered");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user with Mongoose
    const newUser = new User({
      name: {
        first: validatedData.firstName,
        last: validatedData.lastName,
      },
      email: validatedData.email?.toLowerCase() || undefined,
      phone: validatedData.phone
        ? normalizePhoneNumber(validatedData.phone)
        : undefined,
      emailVerified: false,
      phoneVerified: false,
      password: hashedPassword,
      role: "customer",
      addresses: [],
      lastLogin: null,
      preferences: {
        currency: "GHS",
        language: "en",
        notifications: {
          email: true,
          sms: true,
        },
      },
    });

    await newUser.save();

    // Queue welcome notification (email and/or SMS) — don't block signup on send
    const userName =
      `${validatedData.firstName} ${validatedData.lastName}`.trim() || "there";
    const loginUrl =
      process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.toroglo.com";
    try {
      const { addNotificationJob } = await import("@/lib/jobs/queue");
      const emailData = validatedData.email
        ? {
            email: validatedData.email.toLowerCase(),
            name: userName,
            loginUrl: `${loginUrl}/login`,
          }
        : undefined;
      const smsData =
        validatedData.phone && newUser.phone
          ? { phone: newUser.phone, name: userName }
          : undefined;
      if (emailData || smsData) {
        await addNotificationJob("account_welcome", emailData, smsData);
      }
    } catch (notifyError) {
      logger.error("Failed to queue welcome notification", notifyError as Error, {
        endpoint: "/api/auth/signup",
        userId: newUser._id.toString(),
      });
      // Don't fail signup if notification queue fails
    }

    logRequest("POST", "/api/auth/signup", 201, Date.now() - startTime);
    return successResponse(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        phone: newUser.phone,
        name: {
          first: newUser.name.first,
          last: newUser.name.last,
        },
      },
      {},
      201
    );
  } catch (error) {
    logger.error("User signup failed", error as Error, {
      endpoint: "/api/auth/signup",
    });
    logRequest(
      "POST",
      "/api/auth/signup",
      (error as any).statusCode || 500,
      Date.now() - startTime
    );
    return handleApiError(error);
  }
}
