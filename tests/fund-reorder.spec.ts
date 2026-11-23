import { test, expect } from "@playwright/test";

test.describe("Fund Reordering", () => {
  test("Drag a fund within its asset class and save", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();

    // Give US Total Stock Market a second fund after VTI.
    await page.getByRole("button", { name: "Add Fund" }).first().click();
    await page.getByTestId("fund-ticker-0-1").fill("VTSAX");

    await page
      .getByRole("button", { name: "Drag to reorder VTSAX" })
      .dragTo(page.getByRole("button", { name: "Drag to reorder VTI" }), {
        steps: 10,
      });

    await expect(page.getByTestId("fund-ticker-0-0")).toHaveValue("VTSAX");
    await expect(page.getByTestId("fund-ticker-0-1")).toHaveValue("VTI");

    await page.getByRole("button", { name: "Save asset classes" }).click();

    // The holdings table lists the funds in their new order.
    await page.getByRole("link", { name: "Portfolio" }).click();
    await expect(page.getByRole("cell", { name: /^(VTI|VTSAX)$/ })).toHaveText([
      "VTSAX",
      "VTI",
    ]);
  });
});
