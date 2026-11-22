import { describe, it, expect } from "vitest";
import { analyzePortfolio, withPendingChanges } from "./portfolio";
import {
  AccountId,
  AssetClassId,
  createDollarAmount,
  createPercentage,
} from "./types/branded";
import type { AssetClass, PendingChanges } from "./types";

// Holdings are keyed by account id; these stand in for those ids in the mocks.
const ACCOUNT_IDS = {
  k401: "401k" as AccountId,
  roth: "Roth IRA" as AccountId,
  brokerage: "Brokerage" as AccountId,
  hsa: "HSA" as AccountId,
};

const US = "us-stocks-key" as AssetClassId;
const INTL = "intl-stocks-key" as AssetClassId;
const BONDS = "bonds-key" as AssetClassId;

const mockPortfolio: AssetClass[] = [
  {
    name: "US Total Stock Market",
    allocation: createPercentage(60),
    funds: [
      {
        ticker: "VTI" as any,
        values: {
          [ACCOUNT_IDS.k401]: createDollarAmount(3000),
          [ACCOUNT_IDS.roth]: createDollarAmount(2000),
          [ACCOUNT_IDS.brokerage]: createDollarAmount(1000),
        },
        key: "vti-key",
      },
    ],
    key: US,
  },
  {
    name: "International Stocks",
    allocation: createPercentage(30),
    funds: [
      {
        ticker: "VXUS" as any,
        values: {
          [ACCOUNT_IDS.k401]: createDollarAmount(1500),
          [ACCOUNT_IDS.roth]: createDollarAmount(1000),
          [ACCOUNT_IDS.brokerage]: createDollarAmount(500),
        },
        key: "vxus-key",
      },
    ],
    key: INTL,
  },
  {
    name: "Bonds",
    allocation: createPercentage(10),
    funds: [
      {
        ticker: "BND" as any,
        values: {
          [ACCOUNT_IDS.k401]: createDollarAmount(500),
          [ACCOUNT_IDS.roth]: createDollarAmount(300),
          [ACCOUNT_IDS.brokerage]: createDollarAmount(200),
        },
        key: "bnd-key",
      },
    ],
    key: BONDS,
  },
];

const toInvest = 1000;

// Returns mockPortfolio with each asset class's single fund holding only the
// given 401k balance.
function with401kBalances(us: number, intl: number, bonds: number) {
  return mockPortfolio.map((assetClass, i) => ({
    ...assetClass,
    funds: [
      {
        ...assetClass.funds[0],
        values: {
          [ACCOUNT_IDS.k401]: createDollarAmount([us, intl, bonds][i]),
        },
      },
    ],
  }));
}

describe("analyzePortfolio", () => {
  describe("Portfolio Totals", () => {
    it("should calculate total dollars correctly", () => {
      // US: 6000, Intl: 3000, Bonds: 1000 = 10000
      expect(analyzePortfolio(mockPortfolio, toInvest).total).toBe(10000);
    });

    it("should handle empty portfolio", () => {
      expect(analyzePortfolio([], 1000).total).toBe(0);
    });
  });

  describe("Account Calculations", () => {
    it("should calculate total for specific account", () => {
      const { accountTotals } = analyzePortfolio(mockPortfolio, toInvest);

      expect(accountTotals[ACCOUNT_IDS.k401]).toBe(5000); // 3000 + 1500 + 500
      expect(accountTotals[ACCOUNT_IDS.roth]).toBe(3300); // 2000 + 1000 + 300
      expect(accountTotals[ACCOUNT_IDS.brokerage]).toBe(1700); // 1000 + 500 + 200
    });

    it("should have no total for non-existent account", () => {
      const { accountTotals } = analyzePortfolio(mockPortfolio, toInvest);

      expect(accountTotals["NonExistent" as AccountId]).toBeUndefined();
    });

    it("should calculate total for asset class in specific account", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      expect(assetClasses[US].accountTotals[ACCOUNT_IDS.k401]).toBe(3000);
      expect(assetClasses[INTL].accountTotals[ACCOUNT_IDS.roth]).toBe(1000);
      expect(assetClasses[BONDS].accountTotals[ACCOUNT_IDS.brokerage]).toBe(
        200,
      );
    });

    it("should have no asset class total for non-existent account", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      expect(
        assetClasses[US].accountTotals["NonExistent" as AccountId],
      ).toBeUndefined();
    });
  });

  describe("Asset Class Calculations", () => {
    it("should calculate current value for asset class", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      expect(assetClasses[US].current).toBe(6000);
      expect(assetClasses[INTL].current).toBe(3000);
      expect(assetClasses[BONDS].current).toBe(1000);
    });

    it("should calculate current percentage for asset class", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      // US stocks: 6000 / 10000 = 60%
      expect(assetClasses[US].currentPercent).toBeCloseTo(60);
      // Intl stocks: 3000 / 10000 = 30%
      expect(assetClasses[INTL].currentPercent).toBeCloseTo(30);
      // Bonds: 1000 / 10000 = 10%
      expect(assetClasses[BONDS].currentPercent).toBeCloseTo(10);
    });

    it("should handle zero total portfolio when calculating percentages", () => {
      const { assetClasses } = analyzePortfolio(with401kBalances(0, 0, 0), 0);

      expect(assetClasses[US].currentPercent).toBe(0);
    });

    it("should calculate target dollars for asset class", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      // Total with investment: 10000 + 1000 = 11000
      // US stocks (60%): 11000 * 0.6 = 6600
      expect(assetClasses[US].target).toBe(6600);
      // Intl stocks (30%): 11000 * 0.3 = 3300
      expect(assetClasses[INTL].target).toBe(3300);
      // Bonds (10%): 11000 * 0.1 = 1100
      expect(assetClasses[BONDS].target).toBe(1100);
    });

    it("should calculate deltas and projected holdings", () => {
      const { assetClasses } = analyzePortfolio(
        with401kBalances(8000, 1000, 1000),
        1000,
      );

      // Total: 10000; with investment: 11000. US target: 6600.
      expect(assetClasses[US].deltaPercent).toBeCloseTo(80 - 60);
      expect(assetClasses[US].deltaDollars).toBe(6600 - 8000);
      // Intl target: 3300; it receives 1000 * (2300 / (2300 + 100)).
      expect(assetClasses[INTL].projected).toBeCloseTo(1000 + 958.33, 2);
      expect(assetClasses[INTL].projectedPercent).toBeCloseTo(
        (1958.33 / 11000) * 100,
        2,
      );
    });
  });

  describe("Rebalancing Calculations", () => {
    it("should calculate amount to buy for each asset class", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, toInvest);

      // Current: US=6000, Intl=3000, Bonds=1000
      // Target: US=6600, Intl=3300, Bonds=1100
      // Delta: US=+600, Intl=+300, Bonds=+100
      // Total positive delta: 1000
      // ToInvest: 1000
      // US should get: 1000 * (600/1000) = 600
      // Intl should get: 1000 * (300/1000) = 300
      // Bonds should get: 1000 * (100/1000) = 100

      expect(assetClasses[US].toBuy).toBe(600);
      expect(assetClasses[INTL].toBuy).toBe(300);
      expect(assetClasses[BONDS].toBuy).toBe(100);
    });

    it("should handle zero investment amount", () => {
      const { assetClasses } = analyzePortfolio(mockPortfolio, 0);

      expect(assetClasses[US].toBuy).toBe(0);
      expect(assetClasses[INTL].toBuy).toBe(0);
      expect(assetClasses[BONDS].toBuy).toBe(0);
    });

    it("should handle case where asset class is over-allocated", () => {
      // US stocks hold much more than their target
      const { assetClasses } = analyzePortfolio(
        with401kBalances(8000, 1000, 1000),
        1000,
      );

      // US stocks are over-allocated, so should get 0
      expect(assetClasses[US].toBuy).toBe(0);
      // Other asset classes should get positive amounts
      expect(assetClasses[INTL].toBuy).toBeGreaterThan(0);
      expect(assetClasses[BONDS].toBuy).toBeGreaterThan(0);
    });

    it("should handle case with no positive deltas", () => {
      // Every asset class is exactly at target
      const { assetClasses } = analyzePortfolio(
        with401kBalances(6000, 3000, 1000),
        0,
      );

      expect(assetClasses[US].toBuy).toBe(0);
      expect(assetClasses[INTL].toBuy).toBe(0);
      expect(assetClasses[BONDS].toBuy).toBe(0);
    });
  });
});

describe("withPendingChanges (Planning Mode)", () => {
  function analyzeWith(
    pendingChanges: PendingChanges,
    portfolio = mockPortfolio,
  ) {
    return analyzePortfolio(
      withPendingChanges(portfolio, pendingChanges),
      toInvest,
    );
  }

  it("should include pending changes", () => {
    const { total, assetClasses } = analyzeWith({
      "vti-key": { [ACCOUNT_IDS.k401]: 500 },
      "vxus-key": { [ACCOUNT_IDS.roth]: -200 },
    });

    // Original: 401k had 3000 in VTI, now +500 = 3500
    expect(assetClasses[US].accountTotals[ACCOUNT_IDS.k401]).toBe(3500);
    // Original: Roth IRA had 1000 in VXUS, now -200 = 800
    expect(assetClasses[INTL].accountTotals[ACCOUNT_IDS.roth]).toBe(800);
    // Total US stocks: 6000 + 500 = 6500
    expect(assetClasses[US].current).toBe(6500);
    // Total International: 3000 - 200 = 2800
    expect(assetClasses[INTL].current).toBe(2800);
    // Overall total: 10000 + 500 - 200 = 10300
    expect(total).toBe(10300);
  });

  it("should handle pending changes for accounts with zero initial value", () => {
    // HSA account doesn't exist in initial portfolio
    const { total, accountTotals, assetClasses } = analyzeWith({
      "bnd-key": { [ACCOUNT_IDS.hsa]: 1000 },
    });

    // BND in HSA should now be 1000 (from 0)
    expect(assetClasses[BONDS].accountTotals[ACCOUNT_IDS.hsa]).toBe(1000);
    // Total bonds: 1000 (original) + 1000 (pending) = 2000
    expect(assetClasses[BONDS].current).toBe(2000);
    // HSA account total should be 1000
    expect(accountTotals[ACCOUNT_IDS.hsa]).toBe(1000);
    // Overall total: 10000 + 1000 = 11000
    expect(total).toBe(11000);
  });

  it("should leave holdings unchanged when there are no pending changes", () => {
    const { total, assetClasses } = analyzeWith({});

    expect(total).toBe(10000);
    expect(assetClasses[US].current).toBe(6000);
  });

  it("should not add balances for zero pending changes", () => {
    const [usStocks] = withPendingChanges(mockPortfolio, {
      "vti-key": { [ACCOUNT_IDS.hsa]: 0 },
    });

    expect(usStocks.funds[0].values).not.toHaveProperty(ACCOUNT_IDS.hsa);
  });

  it("should not modify the original portfolio", () => {
    withPendingChanges(mockPortfolio, {
      "vti-key": { [ACCOUNT_IDS.k401]: 500, [ACCOUNT_IDS.hsa]: 100 },
    });

    expect(mockPortfolio[0].funds[0].values).toEqual({
      [ACCOUNT_IDS.k401]: 3000,
      [ACCOUNT_IDS.roth]: 2000,
      [ACCOUNT_IDS.brokerage]: 1000,
    });
  });

  it("should handle mixed positive and negative pending changes", () => {
    const { total, assetClasses } = analyzeWith({
      "vti-key": { [ACCOUNT_IDS.k401]: -1000 }, // Sell
      "vxus-key": { [ACCOUNT_IDS.k401]: 500 }, // Buy
      "bnd-key": { [ACCOUNT_IDS.roth]: 500 }, // Buy
    });

    // US stocks: 6000 - 1000 = 5000
    expect(assetClasses[US].current).toBe(5000);
    // International: 3000 + 500 = 3500
    expect(assetClasses[INTL].current).toBe(3500);
    // Bonds: 1000 + 500 = 1500
    expect(assetClasses[BONDS].current).toBe(1500);
    // Overall total: 10000 - 1000 + 500 + 500 = 10000 (balanced rebalancing)
    expect(total).toBe(10000);
  });

  it("should calculate correct percentages with pending changes", () => {
    const { assetClasses } = analyzeWith({
      "vti-key": { [ACCOUNT_IDS.k401]: 2000 }, // Add contribution
    });

    // Total portfolio: 10000 + 2000 = 12000
    // US stocks: 6000 + 2000 = 8000
    // US percentage: 8000 / 12000 = 66.67%
    expect(assetClasses[US].currentPercent).toBeCloseTo(66.67, 2);
    // International: 3000 / 12000 = 25%
    expect(assetClasses[INTL].currentPercent).toBe(25);
  });

  it("should handle pending changes across multiple funds in same asset class", () => {
    const portfolioWithMultipleFunds: AssetClass[] = [
      {
        name: "US Total Stock Market",
        allocation: createPercentage(60),
        funds: [
          {
            ticker: "VTI" as any,
            values: { [ACCOUNT_IDS.k401]: createDollarAmount(3000) },
            key: "vti-key",
          },
          {
            ticker: "VTSAX" as any,
            values: { [ACCOUNT_IDS.roth]: createDollarAmount(2000) },
            key: "vtsax-key",
          },
        ],
        key: US,
      },
    ];

    const { assetClasses } = analyzeWith(
      {
        "vti-key": { [ACCOUNT_IDS.k401]: 500 },
        "vtsax-key": { [ACCOUNT_IDS.roth]: -300 },
      },
      portfolioWithMultipleFunds,
    );

    // US stocks total: (3000 + 500) + (2000 - 300) = 5200
    expect(assetClasses[US].current).toBe(5200);
  });
});
