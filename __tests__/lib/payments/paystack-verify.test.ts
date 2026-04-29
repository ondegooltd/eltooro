describe("verifyWebhookSignature", () => {
  const original = process.env.PAYSTACK_SECRET_KEY;

  afterEach(() => {
    jest.resetModules();
    process.env.PAYSTACK_SECRET_KEY = original;
  });

  it("returns false when secret missing", async () => {
    delete process.env.PAYSTACK_SECRET_KEY;
    jest.resetModules();
    const { verifyWebhookSignature } = await import("@/lib/payments/paystack");
    expect(verifyWebhookSignature({ a: 1 }, "abc")).toBe(false);
  });

  it("accepts valid HMAC for JSON payload", async () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret";
    jest.resetModules();
    const { verifyWebhookSignature } = await import("@/lib/payments/paystack");
    const payload = { event: "charge.success", data: { reference: "REF" } };
    const crypto = await import("crypto");
    const expected = crypto
      .createHmac("sha512", "test_secret")
      .update(JSON.stringify(payload))
      .digest("hex");
    expect(verifyWebhookSignature(payload, expected)).toBe(true);
    expect(verifyWebhookSignature(payload, "bad")).toBe(false);
  });
});
