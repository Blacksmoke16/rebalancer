import { describe, it, expect } from "vitest";
import { renderHook } from "../test/utils";
import { usePortfolioCalculations } from "./usePortfolioCalculations";
import { createDollarAmount, createPercentage } from "../types/branded";

describe("usePortfolioCalculations", () => {
  const mockPortfolio = [
    {
      name: "US Total Stock Market",
      allocation: createPercentage(60),
      funds: [
        {
          ticker: "VTI" as any,
          values: {
            "401k": createDollarAmount(3000),
            "Roth IRA": createDollarAmount(2000),
            Brokerage: createDollarAmount(1000),
          },
          key: "vti-key",
        },
      ],
      key: "us-stocks-key" as any,
    },
    {
      name: "International Stocks",
      allocation: createPercentage(30),
      funds: [
        {
          ticker: "VXUS" as any,
          values: {
            "401k": createDollarAmount(1500),
            "Roth IRA": createDollarAmount(1000),
            Brokerage: createDollarAmount(500),
          },
          key: "vxus-key",
        },
      ],
      key: "intl-stocks-key" as any,
    },
    {
      name: "Bonds",
      allocation: createPercentage(10),
      funds: [
        {
          ticker: "BND" as any,
          values: {
            "401k": createDollarAmount(500),
            "Roth IRA": createDollarAmount(300),
            Brokerage: createDollarAmount(200),
          },
          key: "bnd-key",
        },
      ],
      key: "bonds-key" as any,
    },
  ];

  const toInvest = createDollarAmount(1000);

  describe("Portfolio Totals", () => {
    it("should calculate total dollars correctly", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      const totalDollars = result.current.totalDollars();
      // US: 6000, Intl: 3000, Bonds: 1000 = 10000
      expect(totalDollars).toBe(10000);
    });

    it("should handle empty portfolio", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations([], createDollarAmount(1000)),
      );

      const totalDollars = result.current.totalDollars();
      expect(totalDollars).toBe(0);
    });
  });

  describe("Account Calculations", () => {
    it("should calculate total for specific account", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      expect(result.current.totalForAccount("401k")).toBe(5000); // 3000 + 1500 + 500
      expect(result.current.totalForAccount("Roth IRA")).toBe(3300); // 2000 + 1000 + 300
      expect(result.current.totalForAccount("Brokerage")).toBe(1700); // 1000 + 500 + 200
    });

    it("should return zero for non-existent account", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      expect(result.current.totalForAccount("NonExistent")).toBe(0);
    });

    it("should calculate total for asset class in specific account", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      expect(
        result.current.totalForAssetClassAccount(
          "US Total Stock Market",
          "401k",
        ),
      ).toBe(3000);
      expect(
        result.current.totalForAssetClassAccount(
          "International Stocks",
          "Roth IRA",
        ),
      ).toBe(1000);
      expect(
        result.current.totalForAssetClassAccount("Bonds", "Brokerage"),
      ).toBe(200);
    });

    it("should return zero for non-existent asset class or account", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      expect(
        result.current.totalForAssetClassAccount("NonExistent", "401k"),
      ).toBe(0);
      expect(
        result.current.totalForAssetClassAccount(
          "US Total Stock Market",
          "NonExistent",
        ),
      ).toBe(0);
    });
  });

  describe("Asset Class Calculations", () => {
    it("should calculate current value for asset class", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      expect(result.current.currentForAssetClass(mockPortfolio[0])).toBe(6000); // US stocks total
      expect(result.current.currentForAssetClass(mockPortfolio[1])).toBe(3000); // Intl stocks total
      expect(result.current.currentForAssetClass(mockPortfolio[2])).toBe(1000); // Bonds total
    });

    it("should calculate current percentage for asset class", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      // US stocks: 6000 / 10000 = 0.6 (60%)
      expect(result.current.currentPercentage(mockPortfolio[0])).toBe(0.6);
      // Intl stocks: 3000 / 10000 = 0.3 (30%)
      expect(result.current.currentPercentage(mockPortfolio[1])).toBe(0.3);
      // Bonds: 1000 / 10000 = 0.1 (10%)
      expect(result.current.currentPercentage(mockPortfolio[2])).toBe(0.1);
    });

    it("should handle zero total portfolio when calculating percentages", () => {
      const emptyPortfolio = mockPortfolio.map((ac) => ({
        ...ac,
        funds: ac.funds.map((fund) => ({
          ...fund,
          values: {},
        })),
      }));

      const { result } = renderHook(() =>
        usePortfolioCalculations(emptyPortfolio, createDollarAmount(0)),
      );

      expect(result.current.currentPercentage(emptyPortfolio[0])).toBe(0);
    });

    it("should calculate target dollars for asset class", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      // Total with investment: 10000 + 1000 = 11000
      // US stocks (60%): 11000 * 0.6 = 6600
      expect(result.current.targetDollars(mockPortfolio[0])).toBe(6600);
      // Intl stocks (30%): 11000 * 0.3 = 3300
      expect(result.current.targetDollars(mockPortfolio[1])).toBe(3300);
      // Bonds (10%): 11000 * 0.1 = 1100
      expect(result.current.targetDollars(mockPortfolio[2])).toBe(1100);
    });
  });

  describe("Rebalancing Calculations", () => {
    it("should calculate amount to buy for each asset class", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      // Current: US=6000, Intl=3000, Bonds=1000
      // Target: US=6600, Intl=3300, Bonds=1100
      // Delta: US=+600, Intl=+300, Bonds=+100
      // Total positive delta: 1000
      // ToInvest: 1000
      // US should get: 1000 * (600/1000) = 600
      // Intl should get: 1000 * (300/1000) = 300
      // Bonds should get: 1000 * (100/1000) = 100

      expect(result.current.amountToBuy(mockPortfolio[0])).toBe(600);
      expect(result.current.amountToBuy(mockPortfolio[1])).toBe(300);
      expect(result.current.amountToBuy(mockPortfolio[2])).toBe(100);
    });

    it("should handle zero investment amount", () => {
      const { result } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, createDollarAmount(0)),
      );

      expect(result.current.amountToBuy(mockPortfolio[0])).toBe(0);
      expect(result.current.amountToBuy(mockPortfolio[1])).toBe(0);
      expect(result.current.amountToBuy(mockPortfolio[2])).toBe(0);
    });

    it("should handle case where asset class is over-allocated", () => {
      // Create a portfolio where US stocks are over-allocated
      const overAllocatedPortfolio = [
        {
          ...mockPortfolio[0],
          allocation: createPercentage(60),
          funds: [
            {
              ...mockPortfolio[0].funds[0],
              values: {
                "401k": createDollarAmount(8000), // Much higher than target
              },
            },
          ],
        },
        {
          ...mockPortfolio[1],
          allocation: createPercentage(30),
          funds: [
            {
              ...mockPortfolio[1].funds[0],
              values: {
                "401k": createDollarAmount(1000),
              },
            },
          ],
        },
        {
          ...mockPortfolio[2],
          allocation: createPercentage(10),
          funds: [
            {
              ...mockPortfolio[2].funds[0],
              values: {
                "401k": createDollarAmount(1000),
              },
            },
          ],
        },
      ];

      const { result } = renderHook(() =>
        usePortfolioCalculations(
          overAllocatedPortfolio,
          createDollarAmount(1000),
        ),
      );

      // US stocks are over-allocated, so should get 0
      expect(result.current.amountToBuy(overAllocatedPortfolio[0])).toBe(0);
      // Other asset classes should get positive amounts
      expect(
        result.current.amountToBuy(overAllocatedPortfolio[1]),
      ).toBeGreaterThan(0);
      expect(
        result.current.amountToBuy(overAllocatedPortfolio[2]),
      ).toBeGreaterThan(0);
    });

    it("should handle case with no positive deltas", () => {
      // Create a perfectly balanced portfolio
      const balancedPortfolio = [
        {
          ...mockPortfolio[0],
          allocation: createPercentage(60),
          funds: [
            {
              ...mockPortfolio[0].funds[0],
              values: {
                "401k": createDollarAmount(6000), // Exactly at target
              },
            },
          ],
        },
        {
          ...mockPortfolio[1],
          allocation: createPercentage(30),
          funds: [
            {
              ...mockPortfolio[1].funds[0],
              values: {
                "401k": createDollarAmount(3000), // Exactly at target
              },
            },
          ],
        },
        {
          ...mockPortfolio[2],
          allocation: createPercentage(10),
          funds: [
            {
              ...mockPortfolio[2].funds[0],
              values: {
                "401k": createDollarAmount(1000), // Exactly at target
              },
            },
          ],
        },
      ];

      const { result } = renderHook(() =>
        usePortfolioCalculations(balancedPortfolio, createDollarAmount(0)),
      );

      expect(result.current.amountToBuy(balancedPortfolio[0])).toBe(0);
      expect(result.current.amountToBuy(balancedPortfolio[1])).toBe(0);
      expect(result.current.amountToBuy(balancedPortfolio[2])).toBe(0);
    });
  });

  describe("Memoization", () => {
    it("should return stable function references", () => {
      const { result, rerender } = renderHook(() =>
        usePortfolioCalculations(mockPortfolio, toInvest),
      );

      const firstRenderFunctions = {
        totalForAccount: result.current.totalForAccount,
        totalForAssetClassAccount: result.current.totalForAssetClassAccount,
        currentForAssetClass: result.current.currentForAssetClass,
        currentPercentage: result.current.currentPercentage,
        targetDollars: result.current.targetDollars,
        amountToBuy: result.current.amountToBuy,
        totalDollars: result.current.totalDollars,
      };

      // Re-render with same data
      rerender();

      expect(result.current.totalForAccount).toBe(
        firstRenderFunctions.totalForAccount,
      );
      expect(result.current.totalForAssetClassAccount).toBe(
        firstRenderFunctions.totalForAssetClassAccount,
      );
      expect(result.current.currentForAssetClass).toBe(
        firstRenderFunctions.currentForAssetClass,
      );
      expect(result.current.currentPercentage).toBe(
        firstRenderFunctions.currentPercentage,
      );
      expect(result.current.targetDollars).toBe(
        firstRenderFunctions.targetDollars,
      );
      expect(result.current.amountToBuy).toBe(firstRenderFunctions.amountToBuy);
      expect(result.current.totalDollars).toBe(
        firstRenderFunctions.totalDollars,
      );
    });
  });
});
