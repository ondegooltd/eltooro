import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { MongoClient } from "mongodb";
import {
  generateOTP,
  storeOTP,
  verifyOTP,
  isValidOTP,
  deleteOTP,
} from "@/lib/auth/otp";

describe("OTP System", () => {
  it("should generate a 6-digit OTP", () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
    expect(otp.length).toBe(6);
  });
});

const runPersistence = process.env.RUN_DB_TESTS === "1";
const persist = runPersistence ? describe : describe.skip;

persist("OTP persistence (set RUN_DB_TESTS=1 and start MongoDB)", () => {
  let client: MongoClient;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI as string;
    client = new MongoClient(uri);
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  it("should store and verify OTP", async () => {
    const email = "test@example.com";
    const otp = generateOTP();

    await storeOTP(email, otp, "email");
    const isValid = await verifyOTP(email, otp, "email");
    expect(isValid).toBe(true);
  });

  it("should reject invalid OTP", async () => {
    const email = "test2@example.com";
    const otp = generateOTP();

    await storeOTP(email, otp, "email");
    const isValid = await verifyOTP(email, "000000", "email");
    expect(isValid).toBe(false);
  });

  it("should check if OTP is valid", async () => {
    const email = "test3@example.com";
    const otp = generateOTP();

    await storeOTP(email, otp, "email");
    const isValid = await isValidOTP(email, otp, "email");
    expect(isValid).toBe(true);
  });

  it("should delete OTP", async () => {
    const email = "test4@example.com";
    const otp = generateOTP();

    await storeOTP(email, otp, "email");
    await deleteOTP(email, "email");
    const isValid = await isValidOTP(email, otp, "email");
    expect(isValid).toBe(false);
  });
});
