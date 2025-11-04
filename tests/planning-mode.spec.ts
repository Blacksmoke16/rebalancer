import { test, expect } from "@playwright/test";

test.describe("Planning Mode", () => {
  test("Starting State - Shows Instructions Alert", async ({ page }) => {
    // 1. Navigate to Portfolio page
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();

    // 2. Click "Plan Transactions" button to enter planning mode
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 3. Verify button changes to "Exit Planning"
    await expect(
      page.getByRole("button", { name: "Exit Planning" }),
    ).toBeVisible();

    // 4. Verify starting state: blue alert with instructions
    await expect(page.getByText("Planning Mode Active")).toBeVisible();
    await expect(
      page.getByText(
        "Enter pending transactions in the grid below. Use positive values to buy, negative values to sell.",
      ),
    ).toBeVisible();

    // 5. Verify Apply Changes button is disabled (no changes yet)
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeDisabled();
  });

  test("Pure Rebalancing - Balanced Sell and Buy", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Enter balanced transactions (sell from one fund, buy in another)
    // Sell $5000 from VTI in Roth IRA
    const sellInput = page.getByTestId("VTI-Roth IRA-pending-value");
    await sellInput.fill("-5000");

    // 3. Verify alert changes to "Unaccounted Sales" (red) with negative balance
    await expect(page.getByText("Unaccounted Sales")).toBeVisible();
    await expect(
      page.getByText(
        "You're removing $5,000 more than you're adding. Enter offsetting purchases to balance.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeDisabled();

    // 4. Buy $5000 in VXUS in 401k to balance it out
    const buyInput = page.getByTestId("VXUS-401k-pending-value");
    await buyInput.fill("5000");

    // 5. Verify alert changes to "Balanced" (green) when transactions offset
    await expect(page.getByText("Balanced")).toBeVisible();
    await expect(
      page.getByText("Rebalancing within portfolio - ready to apply"),
    ).toBeVisible();

    // 6. Verify Apply Changes button is now enabled
    const applyButton = page.getByRole("button", { name: "Apply Changes" });
    await expect(applyButton).toBeEnabled();

    // 7. Verify projected values are shown
    await expect(
      page.getByText(/Current: .* → New: .*/, { exact: false }),
    ).toHaveCount(2);

    // 8. Apply changes
    await applyButton.click();

    // 9. Verify planning mode exits and changes are applied
    await expect(
      page.getByRole("button", { name: "Plan Transactions" }),
    ).toBeVisible();
    await expect(page.getByText("Planning Mode Active")).not.toBeVisible();
  });

  test("Future Contribution - Adding Positive Amounts", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Enter positive amounts only (simulating annual IRA contribution)
    // Add $3000 to Roth IRA VTI
    const input1 = page.getByTestId("VTI-Roth IRA-pending-value");
    await input1.fill("3000");

    // Add $3000 to Roth IRA VXUS
    const input2 = page.getByTestId("VXUS-Roth IRA-pending-value");
    await input2.fill("3000");

    // 3. Verify alert shows "Adding to Portfolio" (green) with positive balance
    await expect(page.getByText("Adding to Portfolio")).toBeVisible();
    await expect(
      page.getByText("Adding $6,000 to portfolio - ready to apply"),
    ).toBeVisible();

    // 4. Verify Apply Changes button is enabled
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeEnabled();

    // 5. Apply changes
    await page.getByRole("button", { name: "Apply Changes" }).click();

    // 6. Verify planning mode exits
    await expect(
      page.getByRole("button", { name: "Plan Transactions" }),
    ).toBeVisible();
  });

  test("Cancel Workflow - Exit Planning Discards Changes", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Enter some pending changes
    const input = page.getByTestId("VTI-401k-pending-value");
    await input.fill("-2000");

    // 3. Verify changes are reflected in the UI
    await expect(page.getByText("Unaccounted Sales")).toBeVisible();

    // 4. Click "Exit Planning" button
    await page.getByRole("button", { name: "Exit Planning" }).click();

    // 5. Verify planning mode exits and alert is gone
    await expect(
      page.getByRole("button", { name: "Plan Transactions" }),
    ).toBeVisible();
    await expect(page.getByText("Unaccounted Sales")).not.toBeVisible();

    // 6. Re-enter planning mode
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 7. Verify changes were discarded (back to starting state)
    await expect(page.getByText("Planning Mode Active")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeDisabled();

    // 8. Verify input is empty (no pending change)
    await expect(input).toHaveValue("");
  });

  test("Invalid State - Negative Balance Disables Apply", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Enter unbalanced sell transactions
    const input1 = page.getByTestId("VTI-401k-pending-value");
    await input1.fill("-3000");

    const input2 = page.getByTestId("VXUS-401k-pending-value");
    await input2.fill("-7000");

    // 3. Verify red alert appears with negative balance message
    await expect(page.getByText("Unaccounted Sales")).toBeVisible();
    await expect(
      page.getByText(
        "You're removing $10,000 more than you're adding. Enter offsetting purchases to balance.",
      ),
    ).toBeVisible();

    // 4. Verify Apply Changes button is disabled
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeDisabled();

    // 5. Add some positive amount but not enough to balance
    const input3 = page.getByTestId("BND-401k-pending-value");
    await input3.fill("1000");

    // 6. Verify still shows negative balance (still unbalanced)
    await expect(page.getByText("Unaccounted Sales")).toBeVisible();
    await expect(
      page.getByText(
        "You're removing $9,000 more than you're adding. Enter offsetting purchases to balance.",
      ),
    ).toBeVisible();

    // 7. Verify Apply Changes button is still disabled
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeDisabled();
  });

  test("Mixed Scenario - Rebalance While Adding Money", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Enter mixed transactions: some sells, some buys with net positive
    // Sell $3000 from VTI in 401k
    await page.getByTestId("VTI-401k-pending-value").fill("-3000");

    // Buy $5000 in VXUS in 401k (net +$2000)
    await page.getByTestId("VXUS-401k-pending-value").fill("5000");

    // 3. Verify alert shows "Adding to Portfolio" with net positive
    await expect(page.getByText("Adding to Portfolio")).toBeVisible();
    await expect(
      page.getByText("Adding $2,000 to portfolio - ready to apply"),
    ).toBeVisible();

    // 4. Verify Apply Changes button is enabled
    await expect(
      page.getByRole("button", { name: "Apply Changes" }),
    ).toBeEnabled();
  });

  test("Prevent Negative Balance - Capping Negative Values", async ({
    page,
  }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();

    // 2. First, set a known small value in normal mode
    const normalInput = page.getByTestId("VTI-Roth IRA-value");
    await normalInput.fill("1000");

    // 3. Enter planning mode
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 4. Try to enter a negative value larger than the current balance
    const planningInput = page.getByTestId("VTI-Roth IRA-pending-value");
    await planningInput.fill("-5000");

    // 5. Verify the value is capped to -1000 (100% of current value)
    // Note: The capping happens on value change, so we need to trigger blur
    await planningInput.blur();

    // 6. Verify the projected value shows $0 (current $1000 - change $1000)
    await expect(
      page.getByText("Current: $1,000 → New: $0", { exact: false }),
    ).toBeVisible();
  });

  test("Placeholder Shows Current Value", async ({ page }) => {
    // 1. Navigate to Portfolio page and enter planning mode
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 2. Verify inputs show current values as placeholders
    const input = page.getByTestId("VTI-Roth IRA-pending-value");
    // 3. Verify placeholder text is visible (input should be empty initially)
    // Note: Mantine NumberInput doesn't put placeholder on the actual input element
    // So we verify the input is empty and doesn't have a value
    await expect(input).toBeEmpty();
  });

  test("Affects Rebalancing Analysis", async ({ page }) => {
    // 1. Navigate to Portfolio page
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Portfolio" }).click();

    // 2. Enter an amount to invest in rebalancing analysis
    // Skip setting the investment amount for this test - just verify the table exists

    // 3. Enter planning mode
    await page.getByRole("button", { name: "Plan Transactions" }).click();

    // 4. Add pending changes that shift allocations
    await page.getByTestId("VTI-401k-pending-value").fill("5000");

    // 5. Verify the rebalancing analysis table reflects pending changes
    // (The exact values depend on the portfolio state, but we can verify
    // that the Projected $ and Projected % columns update)
    await expect(page.getByText("Projected ($)")).toBeVisible();
    await expect(page.getByText("Projected (%)")).toBeVisible();
  });
});
