import { test, expect } from "@playwright/test";

// Clear localStorage before each test to ensure isolation
test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
  await page.evaluate(() => localStorage.clear());
});

test.describe("Account Reordering", () => {
  test("Drag account to reorder", async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();

    // 2. Verify initial order (401k, Roth IRA, Taxable Brokerage)
    const accountInputs = page.locator('input[placeholder*="Account"]');
    await expect(accountInputs.nth(0)).toHaveValue("401k");
    await expect(accountInputs.nth(1)).toHaveValue("Roth IRA");
    await expect(accountInputs.nth(2)).toHaveValue("Taxable Brokerage");

    // 3. Drag first account (401k) to last position
    const firstHandle = page.getByRole("button", {
      name: "Drag to reorder 401k",
    });
    const lastHandle = page.getByRole("button", {
      name: "Drag to reorder Taxable Brokerage",
    });
    await firstHandle.dragTo(lastHandle, { steps: 10 });

    // 4. Verify new order (Roth IRA, Taxable Brokerage, 401k)
    await expect(accountInputs.nth(0)).toHaveValue("Roth IRA");
    await expect(accountInputs.nth(1)).toHaveValue("Taxable Brokerage");
    await expect(accountInputs.nth(2)).toHaveValue("401k");

    // 5. Verify Save Changes button is enabled (form is dirty)
    // Note: .first() selects the first Save Changes button (accounts section)
    const saveButton = page
      .getByRole("button", { name: "Save Changes" })
      .first();
    await expect(saveButton).toBeEnabled();
  });

  test("Reorder persists after save", async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();

    // 2. Verify initial order
    const accountInputs = page.locator('input[placeholder*="Account"]');
    await expect(accountInputs.nth(0)).toHaveValue("401k");

    // 3. Drag first account to last
    const firstHandle = page.getByRole("button", {
      name: "Drag to reorder 401k",
    });
    const lastHandle = page.getByRole("button", {
      name: "Drag to reorder Taxable Brokerage",
    });
    await firstHandle.dragTo(lastHandle, { steps: 10 });

    // 4. Verify reorder happened
    await expect(accountInputs.nth(0)).toHaveValue("Roth IRA");
    await expect(accountInputs.nth(2)).toHaveValue("401k");

    // 5. Save changes
    const saveButton = page
      .getByRole("button", { name: "Save Changes" })
      .first();
    await saveButton.click();

    // 6. Wait for save to complete (button becomes disabled)
    await expect(saveButton).toBeDisabled();

    // 7. Wait for debounced save to localStorage (1000ms + buffer)
    await page.waitForTimeout(1500);

    // 8. Reload page
    await page.reload();

    // 9. Navigate back to Settings
    await page.getByRole("link", { name: "Settings" }).click();

    // 10. Verify order persisted
    const accountInputsAfterReload = page.locator(
      'input[placeholder*="Account"]',
    );
    await expect(accountInputsAfterReload.nth(0)).toHaveValue("Roth IRA");
    await expect(accountInputsAfterReload.nth(1)).toHaveValue(
      "Taxable Brokerage",
    );
    await expect(accountInputsAfterReload.nth(2)).toHaveValue("401k");
  });

  test("Unsaved changes do not persist after reload", async ({ page }) => {
    // 1. Navigate to Settings page
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();

    // 2. Verify initial order
    const accountInputs = page.locator('input[placeholder*="Account"]');
    await expect(accountInputs.nth(0)).toHaveValue("401k");

    // 3. Drag first account to last
    const firstHandle = page.getByRole("button", {
      name: "Drag to reorder 401k",
    });
    const lastHandle = page.getByRole("button", {
      name: "Drag to reorder Taxable Brokerage",
    });
    await firstHandle.dragTo(lastHandle, { steps: 10 });

    // 4. Verify reorder happened in UI
    await expect(accountInputs.nth(0)).toHaveValue("Roth IRA");

    // 5. Verify Save Changes button is enabled (form has unsaved changes)
    const saveButton = page
      .getByRole("button", { name: "Save Changes" })
      .first();
    await expect(saveButton).toBeEnabled();

    // 6. Reload page WITHOUT saving
    await page.reload();

    // 7. Navigate back to Settings
    await page.getByRole("link", { name: "Settings" }).click();

    // 8. Verify original order is restored (unsaved changes were discarded)
    const accountInputsAfter = page.locator('input[placeholder*="Account"]');
    await expect(accountInputsAfter.nth(0)).toHaveValue("401k");
    await expect(accountInputsAfter.nth(1)).toHaveValue("Roth IRA");
    await expect(accountInputsAfter.nth(2)).toHaveValue("Taxable Brokerage");
  });
});
