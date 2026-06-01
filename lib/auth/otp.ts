import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { randomInt } from "crypto";
import { ApiError } from "@/lib/errors/api-error";

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;
const MAX_OTP_REQUESTS_PER_HOUR = 3;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Generate a cryptographically random 6-digit OTP.
 */
export function generateOTP(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Store OTP in MongoDB with TTL
 */
export async function storeOTP(
  identifier: string, // email or phone
  otp: string,
  type: "email" | "phone"
): Promise<void> {
  const db = await getDb();
  const otpCollection = db.collection("otps");

  // Hourly cap.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOTPs = await otpCollection.countDocuments({
    identifier,
    type,
    createdAt: { $gte: oneHourAgo },
  });

  if (recentOTPs >= MAX_OTP_REQUESTS_PER_HOUR) {
    throw new ApiError(
      429,
      "TOO_MANY_REQUESTS",
      "Too many OTP requests. Please try again later.",
    );
  }

  // Per-request cooldown: an attacker spamming /otp/send would otherwise
  // delete a legitimate user's pending code on each call. Refuse if the
  // most recent code was issued within the cooldown window.
  const cooldownStart = new Date(Date.now() - OTP_RESEND_COOLDOWN_MS);
  const tooSoon = await otpCollection.findOne({
    identifier,
    type,
    createdAt: { $gte: cooldownStart },
  });
  if (tooSoon) {
    throw new ApiError(
      429,
      "TOO_MANY_REQUESTS",
      "Please wait before requesting another OTP.",
    );
  }

  // Delete any existing OTPs for this identifier
  await otpCollection.deleteMany({ identifier, type });

  // Store new OTP with TTL
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await otpCollection.insertOne({
    identifier,
    type,
    otp,
    createdAt: new Date(),
    expiresAt,
    verified: false,
  });

  // Create TTL index if it doesn't exist (run once)
  try {
    await otpCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 }
    );
  } catch (error) {
    // Index might already exist, ignore
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  identifier: string,
  otp: string,
  type: "email" | "phone"
): Promise<boolean> {
  const db = await getDb();
  const otpCollection = db.collection("otps");

  const otpRecord = await otpCollection.findOne({
    identifier,
    type,
    otp,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return false;
  }

  // Mark as verified
  await otpCollection.updateOne(
    { _id: otpRecord._id },
    { $set: { verified: true } }
  );

  return true;
}

/**
 * Check if OTP exists and is valid (not expired, not verified)
 */
export async function isValidOTP(
  identifier: string,
  otp: string,
  type: "email" | "phone"
): Promise<boolean> {
  const db = await getDb();
  const otpCollection = db.collection("otps");

  const otpRecord = await otpCollection.findOne({
    identifier,
    type,
    otp,
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  return !!otpRecord;
}

/**
 * Delete OTP (after successful verification or manual cleanup)
 */
export async function deleteOTP(
  identifier: string,
  type: "email" | "phone"
): Promise<void> {
  const db = await getDb();
  const otpCollection = db.collection("otps");

  await otpCollection.deleteMany({ identifier, type });
}

/**
 * Get remaining time for OTP expiry (in seconds)
 */
export async function getOTPExpiryTime(
  identifier: string,
  type: "email" | "phone"
): Promise<number | null> {
  const db = await getDb();
  const otpCollection = db.collection("otps");

  const otpRecord = await otpCollection.findOne({
    identifier,
    type,
    verified: false,
  });

  if (!otpRecord || !otpRecord.expiresAt) {
    return null;
  }

  const now = new Date();
  const expiresAt = new Date(otpRecord.expiresAt);
  const remaining = Math.max(
    0,
    Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  );

  return remaining;
}
