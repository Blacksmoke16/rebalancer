import { test, expect, type Page, type Request } from "@playwright/test";

// Quote dates are shown in local time.
test.use({ timezoneId: "America/New_York" });

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "x-api-key",
};

// 2026-11-20 4:00:02 PM in New York, a market close.
const QUOTE_TIME = 1795208402;

// Answers financeapi.net quote requests with the given prices, leaving out
// symbols without one as the real API does, and records each request.
async function stubQuotes(
  page: Page,
  prices: Record<string, number>,
  requests: Request[] = [],
) {
  await page.route("https://yfapi.net/**", async (route) => {
    const request = route.request();
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }
    requests.push(request);
    const symbols =
      new URL(request.url()).searchParams.get("symbols")?.split(",") ?? [];
    await route.fulfill({
      headers: CORS_HEADERS,
      json: {
        quoteResponse: {
          result: symbols
            .filter((symbol) => symbol in prices)
            .map((symbol) => ({
              symbol,
              regularMarketPrice: prices[symbol],
              regularMarketTime: QUOTE_TIME,
              currency: "USD",
            })),
          error: null,
        },
      },
    });
  });
}

async function saveApiKey(page: Page, apiKey: string) {
  await page.addInitScript((key) => {
    localStorage.setItem("rebalancer-api-key", JSON.stringify(key));
  }, apiKey);
}

async function openPortfolio(page: Page) {
  await page.goto("http://localhost:5173");
  await page.getByRole("link", { name: "Portfolio" }).click();
}

// Switches a dollar fund to shares, converting its balances at the given price.
async function convertToShares(page: Page, ticker: string, price: string) {
  await page.getByTestId(`${ticker}-unit`).getByText("Shares").click();
  const priceInput = page.getByLabel(`${ticker} price per share`);
  await priceInput.fill(price);
  await page.getByRole("button", { name: "Convert to shares" }).click();
  // The popover stays in the page, hidden, while it animates closed; wait for
  // it to go so the next conversion's popover is the only one.
  await expect(priceInput).toHaveCount(0);
}

test.describe("Price Refresh", () => {
  test("Refreshes prices with an API key entered in Settings", async ({
    page,
  }) => {
    const requests: Request[] = [];
    await stubQuotes(page, { VTI: 300 }, requests);

    await page.goto("http://localhost:5173");
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByLabel("API key").fill("test-key");

    await page.getByRole("link", { name: "Portfolio" }).click();
    // $3,730 in the 401k at $250 is 14.92 shares.
    await convertToShares(page, "VTI", "250");
    await expect(
      page.getByText("Prices haven't been refreshed yet."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Refresh prices" }).click();

    await expect(page.getByText("Updated 1 price.")).toBeVisible();
    await expect(page.getByTestId("VTI-price")).toHaveValue("300");
    await expect(page.getByText("as of Nov 20, 2026")).toBeVisible();
    // 14.92 shares at $300
    await expect(page.getByText("≈ $4,476")).toBeVisible();
    await expect(
      page.getByText(
        /^Prices last updated \w{3} \d{1,2}, \d{4}, \d{1,2}:\d{2}\s(AM|PM)$/,
      ),
    ).toBeVisible();

    expect(requests).toHaveLength(1);
    expect(requests[0].url()).toBe(
      "https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=VTI",
    );
    expect(requests[0].headers()["x-api-key"]).toBe("test-key");

    // When prices were refreshed is saved with the portfolio.
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("rebalancer-portfolio-data")),
      )
      .toContain('"pricesUpdatedAt":"');
    await page.reload();
    await expect(page.getByText(/^Prices last updated/)).toBeVisible();
  });

  test("Names tickers it couldn't price", async ({ page }) => {
    await saveApiKey(page, "test-key");
    await stubQuotes(page, { VTI: 300 });
    await openPortfolio(page);
    await convertToShares(page, "VTI", "250");
    await convertToShares(page, "BND", "70");

    await page.getByRole("button", { name: "Refresh prices" }).click();

    await expect(
      page.getByText(
        "Updated 1 price. Couldn't find a price for BND; check those tickers in Settings.",
      ),
    ).toBeVisible();
    await expect(page.getByTestId("VTI-price")).toHaveValue("300");
    await expect(page.getByTestId("BND-price")).toHaveValue("70");
  });

  test("Explains a rejected API key and keeps the old prices", async ({
    page,
  }) => {
    await saveApiKey(page, "bad-key");
    await page.route("https://yfapi.net/**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
      }
      await route.fulfill({
        status: 403,
        headers: CORS_HEADERS,
        json: {
          message: "Forbidden",
          hint: "Sign up for API key https://financeapi.net/tutorial",
        },
      });
    });
    await openPortfolio(page);
    await convertToShares(page, "VTI", "250");

    await page.getByRole("button", { name: "Refresh prices" }).click();

    await expect(page.getByText("Couldn't refresh prices")).toBeVisible();
    await expect(
      page.getByText(
        "The API key was rejected. Check it in Settings → Price data.",
      ),
    ).toBeVisible();
    await expect(page.getByTestId("VTI-price")).toHaveValue("250");
    await expect(
      page.getByText("Prices haven't been refreshed yet."),
    ).toBeVisible();
  });

  test("Works with manual prices until an API key is added", async ({
    page,
  }) => {
    await openPortfolio(page);
    // The callout only appears once a fund tracks shares.
    await expect(
      page.getByRole("button", { name: "Refresh prices" }),
    ).toHaveCount(0);

    await convertToShares(page, "VTI", "250");
    await expect(
      page.getByRole("button", { name: "Refresh prices" }),
    ).toBeDisabled();

    // Prices can still be typed in: 14.92 shares at $260.
    await page.getByTestId("VTI-price").fill("260");
    await expect(page.getByText("≈ $3,879")).toBeVisible();

    await page.getByRole("button", { name: "Settings → Price data" }).click();
    await expect(page.getByLabel("API key")).toBeVisible();
  });

  test("Can't refresh while planning", async ({ page }) => {
    await saveApiKey(page, "test-key");
    await openPortfolio(page);
    await convertToShares(page, "VTI", "250");

    await page.getByRole("button", { name: "Plan Transactions" }).click();

    await expect(
      page.getByRole("button", { name: "Refresh prices" }),
    ).toBeDisabled();
    await expect(
      page.getByText("Exit planning to refresh prices."),
    ).toBeVisible();
  });
});
