import { test, expect, type Page } from "@playwright/test";

// Default portfolio: VTI holds $3,730 in the 401k, $6,927 in the Roth IRA, and
// $19,714 in the taxable brokerage account.

async function openPortfolio(page: Page) {
  await page.goto("http://localhost:5173");
  await page.getByRole("link", { name: "Portfolio" }).click();
}

// Switches a dollar fund to shares, converting its balances at the given price.
async function convertToShares(page: Page, ticker: string, price: string) {
  await page.getByTestId(`${ticker}-unit`).getByText("Shares").click();
  await page.getByLabel(`${ticker} price per share`).fill(price);
  await page.getByRole("button", { name: "Convert to shares" }).click();
}

test.describe("Share Funds", () => {
  test("Converts a fund to shares at a price and back to dollars", async ({
    page,
  }) => {
    await openPortfolio(page);

    await convertToShares(page, "VTI", "297.15");

    // $3,730 / $297.15 per share
    const vti401k = page.getByTestId("VTI-401k-value");
    await expect(vti401k).toHaveValue("12.552583");
    await expect(page.getByText("≈ $3,730")).toBeVisible();
    // The "$" is shown beside the input rather than in its value.
    await expect(page.getByTestId("VTI-price")).toHaveValue("297.15");
    await expect(page.getByText(/^as of \w{3} \d{1,2}, \d{4}$/)).toBeVisible();

    // Share counts accept decimals and are valued at the price.
    await vti401k.fill("20.5");
    await expect(page.getByText("≈ $6,092")).toBeVisible();

    // Changing the price revalues the holding.
    await page.getByTestId("VTI-price").fill("300");
    await expect(page.getByText("≈ $6,150")).toBeVisible();

    // Shares and price are saved.
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("rebalancer-portfolio-data")),
      )
      .toContain('"price":300');
    await page.reload();
    await expect(vti401k).toHaveValue("20.5");

    // Back to dollars at the fund's price: 20.5 x $300.
    await page.getByTestId("VTI-unit").getByText("$", { exact: true }).click();
    await expect(vti401k).toHaveValue("6,150");
    await expect(page.getByTestId("VTI-price")).toHaveCount(0);
  });

  test("Warns about an unpriced share fund and blocks planning it", async ({
    page,
  }) => {
    await openPortfolio(page);
    await convertToShares(page, "VTI", "297.15");

    await page.getByTestId("VTI-price").fill("");

    await expect(page.getByText("Missing prices")).toBeVisible();
    await expect(
      page.getByText(
        "These share funds count as $0 until you enter a price in the Price column: VTI",
      ),
    ).toBeVisible();
    await expect(page.getByText("≈ $0").first()).toBeVisible();
    // Switching back to dollars needs a price to convert with.
    await expect(
      page.getByTestId("VTI-unit").getByRole("radio", { name: "$" }),
    ).toBeDisabled();

    await page.getByRole("button", { name: "Plan Transactions" }).click();
    await expect(page.getByTestId("VTI-401k-pending-value")).toBeDisabled();
    await page.getByRole("button", { name: "Exit Planning" }).click();

    await page.getByTestId("VTI-price").fill("250");
    await expect(page.getByText("Missing prices")).toHaveCount(0);
  });

  test("Plans a buy in dollars and applies it as shares", async ({ page }) => {
    await openPortfolio(page);
    // $3,730 / $250 = 14.92 shares
    await convertToShares(page, "VTI", "250");

    await page.getByRole("button", { name: "Plan Transactions" }).click();
    // Prices and units can't change while planning.
    await expect(page.getByTestId("VTI-price")).toBeDisabled();
    await expect(
      page.getByTestId("VTI-unit").getByRole("radio", { name: "$" }),
    ).toBeDisabled();

    await page.getByTestId("VTI-401k-pending-value").fill("1000");
    await expect(
      page.getByText("Current: $3,730 → New: $4,730 (≈ +4 shares)"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Apply Changes" }).click();

    await expect(page.getByTestId("VTI-401k-value")).toHaveValue("18.92");
  });

  test("Requires a single ticker symbol to track shares", async ({ page }) => {
    await openPortfolio(page);
    await convertToShares(page, "VTI", "297.15");

    // A share fund's ticker must be a single symbol.
    await page.getByRole("link", { name: "Settings" }).click();
    const vtiTicker = page.getByTestId("fund-ticker-0-0");
    await vtiTicker.fill("VTSAX / VTI");
    await expect(
      page.getByText("Use a single ticker symbol, like VTI or BRK-B"),
    ).toBeVisible();
    await vtiTicker.fill("BRK-B");
    await expect(
      page.getByText("Use a single ticker symbol, like VTI or BRK-B"),
    ).toHaveCount(0);

    // A dollar fund listing several tickers can't switch to shares.
    await page.getByTestId("fund-ticker-1-0").fill("VTIAX / VXUS");
    // .last() selects the asset classes section's Save Changes button
    await page.getByRole("button", { name: "Save Changes" }).last().click();
    await page.getByRole("link", { name: "Portfolio" }).click();
    await expect(
      page.getByTestId("VTIAX / VXUS-unit").getByRole("radio", {
        name: "Shares",
      }),
    ).toBeDisabled();
    await expect(
      page.getByText("Shares need a single ticker symbol"),
    ).toBeVisible();
  });

  test("Shows shares times price on mobile", async ({ page }) => {
    await openPortfolio(page);
    await convertToShares(page, "VTI", "297.15");

    await page.setViewportSize({ width: 400, height: 900 });

    await expect(
      page.getByText("12.552583 sh × $297.15 = $3,730"),
    ).toBeVisible();
  });
});
