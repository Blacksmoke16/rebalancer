import { test, expect } from "@playwright/test";

// Clear localStorage before each test to ensure isolation
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Tab Persistence", () => {
  test("Restores the last viewed tab after a reload", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(
      page.getByRole("heading", { name: "Configuration" }),
    ).toBeVisible();

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Configuration" }),
    ).toBeVisible();
  });

  test("Restores a tab saved as a plain string", async ({ page }) => {
    // Earlier versions stored the tab name without JSON encoding.
    await page.evaluate(() =>
      localStorage.setItem("rebalancer-active-tab", "portfolio"),
    );

    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Current Holdings" }),
    ).toBeVisible();
  });
});
