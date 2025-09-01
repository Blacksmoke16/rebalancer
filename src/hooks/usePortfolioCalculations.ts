import { useCallback, useMemo } from "react";
import { AssetClass } from "../types";

interface UsePortfolioCalculationsReturn {
  currentForAssetClass: (assetClass: AssetClass) => number;
  currentPercentage: (assetClass: AssetClass) => number;
  targetDollars: (assetClass: AssetClass) => number;
  amountToBuy: (assetClass: AssetClass) => number;
  totalForAccount: (accountName: string) => number;
  totalForAssetClassAccount: (
    assetClassName: string,
    accountName: string,
  ) => number;
  totalDollars: () => number;
}

export function usePortfolioCalculations(
  portfolio: AssetClass[],
  toInvest: number,
): UsePortfolioCalculationsReturn {
  // Memoized calculations that depend on portfolio but not individual asset classes
  const portfolioTotals = useMemo(() => {
    const totalDollars = portfolio.reduce((acc, assetClass) => {
      return (
        acc +
        assetClass.funds.reduce((fundAcc, fund) => {
          return (
            fundAcc +
            Object.values(fund.values).reduce(
              (valueAcc, value) => valueAcc + value,
              0,
            )
          );
        }, 0)
      );
    }, 0);

    const totalWithInvestment = totalDollars + toInvest;

    return { totalDollars, totalWithInvestment };
  }, [portfolio, toInvest]);

  // Stable utility functions that only depend on portfolio structure
  const totalForAccount = useCallback(
    (accountName: string): number => {
      return portfolio.reduce((assetAcc, assetClass) => {
        return (
          assetAcc +
          assetClass.funds.reduce((fundAcc, fund) => {
            return fundAcc + (fund.values[accountName] ?? 0);
          }, 0)
        );
      }, 0);
    },
    [portfolio],
  );

  const totalForAssetClassAccount = useCallback(
    (assetClassName: string, accountName: string): number => {
      const assetClass = portfolio.find((ac) => ac.name === assetClassName);
      if (!assetClass) return 0;

      return assetClass.funds.reduce((fundAcc, fund) => {
        return fundAcc + (fund.values[accountName] ?? 0);
      }, 0);
    },
    [portfolio],
  );

  const currentForAssetClass = useCallback((assetClass: AssetClass): number => {
    return assetClass.funds.reduce((fundAcc, fund) => {
      return (
        fundAcc +
        Object.values(fund.values).reduce(
          (valueAcc, value) => valueAcc + value,
          0,
        )
      );
    }, 0);
  }, []);

  // Functions that depend on both portfolio and toInvest
  const currentPercentage = useCallback(
    (assetClass: AssetClass): number => {
      return portfolioTotals.totalDollars > 0
        ? currentForAssetClass(assetClass) / portfolioTotals.totalDollars
        : 0;
    },
    [currentForAssetClass, portfolioTotals.totalDollars],
  );

  const targetDollars = useCallback(
    (assetClass: AssetClass): number => {
      return (
        portfolioTotals.totalWithInvestment * (assetClass.allocation / 100)
      );
    },
    [portfolioTotals.totalWithInvestment],
  );

  const amountToBuy = useCallback(
    (assetClass: AssetClass): number => {
      if (toInvest <= 0) {
        return 0;
      }

      const deltaDollars =
        targetDollars(assetClass) - currentForAssetClass(assetClass);

      const positiveDeltaDollars = portfolio.reduce((acc, ac) => {
        const delta = targetDollars(ac) - currentForAssetClass(ac);
        return delta > 0 ? acc + delta : acc;
      }, 0);

      if (positiveDeltaDollars === 0) {
        return 0;
      }

      return Math.max(0, toInvest * (deltaDollars / positiveDeltaDollars));
    },
    [portfolio, toInvest, targetDollars, currentForAssetClass],
  );

  const totalDollars = useCallback(
    (): number => portfolioTotals.totalDollars,
    [portfolioTotals.totalDollars],
  );

  return {
    currentForAssetClass,
    currentPercentage,
    targetDollars,
    amountToBuy,
    totalForAccount,
    totalForAssetClassAccount,
    totalDollars,
  };
}
