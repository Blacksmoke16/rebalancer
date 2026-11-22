import { test, expect } from "@playwright/test";

// Clear localStorage before each test to ensure isolation
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Account Deletion", () => {
  test("Removes a deleted account's holdings from the totals", async ({
    page,
  }) => {
    await page.goto("http://localhost:5173");
    const totalValue = page.getByText("Total Portfolio Value").locator("..");

    // 1. Default holdings total $53,034, of which $26,393 is in the 401k
    await page.getByRole("link", { name: "Portfolio" }).click();
    await expect(totalValue).toContainText("$53,034");

    // 2. Delete the 401k account and save
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Delete account 401k" }).click();
    // .first() selects the accounts section's Save Changes button
    await page.getByRole("button", { name: "Save Changes" }).first().click();

    // 3. Only the remaining accounts' holdings are counted
    await page.getByRole("link", { name: "Portfolio" }).click();
    await expect(totalValue).toContainText("$26,641");
  });
});
