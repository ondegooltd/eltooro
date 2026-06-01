import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Toroglo/i);
  });

  test("products page responds", async ({ page }) => {
    const res = await page.goto("/products");
    expect(res?.ok()).toBeTruthy();
  });
});
