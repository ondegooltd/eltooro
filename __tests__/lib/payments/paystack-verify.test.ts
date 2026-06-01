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
    expect(verifyWebhookSignature("{\"a\":1}", "abc")).toBe(false);
  });

  it("accepts valid HMAC for raw body string", async () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret";
    jest.resetModules();
    const { verifyWebhookSignature } = await import("@/lib/payments/paystack");
    const rawBody = '{"event":"charge.success","data":{"reference":"REF"}}';
    const crypto = await import("crypto");
    const expected = crypto
      .createHmac("sha512", "test_secret")
      .update(rawBody)
      .digest("hex");
    expect(verifyWebhookSignature(rawBody, expected)).toBe(true);
    expect(verifyWebhookSignature(rawBody, "bad")).toBe(false);
  });

  it("rejects mismatch when body bytes differ from what was signed", async () => {
    process.env.PAYSTACK_SECRET_KEY = "test_secret";
    jest.resetModules();
    const { verifyWebhookSignature } = await import("@/lib/payments/paystack");
    const original = '{"event":"charge.success","data":{"reference":"REF"}}';
    const reformatted = JSON.stringify(JSON.parse(original));
    const crypto = await import("crypto");
    const sigForOriginal = crypto
      .createHmac("sha512", "test_secret")
      .update(original)
      .digest("hex");
    // Same JSON content, but different bytes (added whitespace via parse/stringify
    // round-trip would normally match here; this asserts that we verify exact
    // bytes by signing one form and checking another with extra whitespace).
    const tampered = reformatted.replace(":", ": ");
    expect(verifyWebhookSignature(tampered, sigForOriginal)).toBe(false);
  });
});
