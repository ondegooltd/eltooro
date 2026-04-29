import { describe, it, expect, beforeEach, jest } from "@jest/globals";

let generateOrderNumber: typeof import("@/lib/orders/generateOrderNumber").generateOrderNumber;

beforeEach(async () => {
  jest.resetModules();
  jest.doMock("@/lib/db/mongodb", () => ({
    getDb: jest.fn().mockResolvedValue({
      collection: () => ({
        findOne: jest.fn().mockResolvedValue(null),
      }),
    }),
  }));
  ({ generateOrderNumber } = await import("@/lib/orders/generateOrderNumber"));
});

describe("generateOrderNumber", () => {
  it("should generate order number with correct format", async () => {
    const orderNumber = await generateOrderNumber("ORD");
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{5}$/);
  });

  it("should generate unique order numbers", async () => {
    const order1 = await generateOrderNumber("ORD");
    const order2 = await generateOrderNumber("ORD");
    expect(order1).not.toBe(order2);
  });

  it("should use custom prefix", async () => {
    const orderNumber = await generateOrderNumber("TEST");
    expect(orderNumber).toMatch(/^TEST-\d{8}-\d{5}$/);
  });

  it("should use default prefix when not provided", async () => {
    const orderNumber = await generateOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d{8}-\d{5}$/);
  });
});
