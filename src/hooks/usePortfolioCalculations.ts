import { useCallback, useMemo } from "react";
import { AssetClass } from "../types";
import { PendingChanges } from "./usePortfolioData";

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

function getPendingChangeKey(
  assetClassName: string,
  fundTicker: string,
  accountName: string,
): string {
  return `${assetClassName}|${fundTicker}|${accountName}`;
}

export function usePortfolioCalculations(
  portfolio: AssetClass[],
  toInvest: number,
  pendingChanges: PendingChanges = {},
  usePendingValues = false,
): UsePortfolioCalculationsReturn {
  // Helper function to get the effective value (current + pending if needed)
  const getEffectiveValue = useCallback(
    (
      currentValue: number,
      assetClassName: string,
      fundTicker: string,
      accountName: string,
    ): number => {
      if (!usePendingValues) {
        return currentValue;
      }
      const key = getPendingChangeKey(assetClassName, fundTicker, accountName);
      const pendingChange = pendingChanges[key] ?? 0;
      return currentValue + pendingChange;
    },
    [pendingChanges, usePendingValues],
  );
  // Memoized calculations that depend on portfolio but not individual asset classes
  const portfolioTotals = useMemo(() => {
    const totalDollars = portfolio.reduce((acc, assetClass) => {
      return (
        acc +
        assetClass.funds.reduce((fundAcc, fund) => {
          // Sum values from existing fund.values entries
          let fundTotal = Object.entries(fund.values).reduce(
            (valueAcc, [accountName, value]) => {
              const effectiveValue = getEffectiveValue(
                value,
                assetClass.name,
                fund.ticker,
                accountName,
              );
              return valueAcc + effectiveValue;
            },
            0,
          );

          // Add pending changes for accounts not in fund.values
          if (usePendingValues) {
            const existingAccounts = new Set(Object.keys(fund.values));
            Object.entries(pendingChanges).forEach(([key, pendingChange]) => {
              const [changeAssetClass, changeFundTicker, changeAccount] =
                key.split("|");
              if (
                changeAssetClass === assetClass.name &&
                changeFundTicker === fund.ticker &&
                !existingAccounts.has(changeAccount)
              ) {
                fundTotal += pendingChange;
              }
            });
          }

          return fundAcc + fundTotal;
        }, 0)
      );
    }, 0);

    const totalWithInvestment = totalDollars + toInvest;

    return { totalDollars, totalWithInvestment };
  }, [
    portfolio,
    toInvest,
    getEffectiveValue,
    usePendingValues,
    pendingChanges,
  ]);

  // Stable utility functions that only depend on portfolio structure
  const totalForAccount = useCallback(
    (accountName: string): number => {
      return portfolio.reduce((assetAcc, assetClass) => {
        return (
          assetAcc +
          assetClass.funds.reduce((fundAcc, fund) => {
            const currentValue = fund.values[accountName] ?? 0;
            const effectiveValue = getEffectiveValue(
              currentValue,
              assetClass.name,
              fund.ticker,
              accountName,
            );
            return fundAcc + effectiveValue;
          }, 0)
        );
      }, 0);
    },
    [portfolio, getEffectiveValue],
  );

  const totalForAssetClassAccount = useCallback(
    (assetClassName: string, accountName: string): number => {
      const assetClass = portfolio.find((ac) => ac.name === assetClassName);
      if (!assetClass) return 0;

      return assetClass.funds.reduce((fundAcc, fund) => {
        const currentValue = fund.values[accountName] ?? 0;
        const effectiveValue = getEffectiveValue(
          currentValue,
          assetClass.name,
          fund.ticker,
          accountName,
        );
        return fundAcc + effectiveValue;
      }, 0);
    },
    [portfolio, getEffectiveValue],
  );

  const currentForAssetClass = useCallback(
    (assetClass: AssetClass): number => {
      return assetClass.funds.reduce((fundAcc, fund) => {
        // Sum values from existing fund.values entries
        let fundTotal = Object.entries(fund.values).reduce(
          (valueAcc, [accountName, value]) => {
            const effectiveValue = getEffectiveValue(
              value,
              assetClass.name,
              fund.ticker,
              accountName,
            );
            return valueAcc + effectiveValue;
          },
          0,
        );

        // Add pending changes for accounts not in fund.values
        if (usePendingValues) {
          const existingAccounts = new Set(Object.keys(fund.values));
          Object.entries(pendingChanges).forEach(([key, pendingChange]) => {
            const [changeAssetClass, changeFundTicker, changeAccount] =
              key.split("|");
            if (
              changeAssetClass === assetClass.name &&
              changeFundTicker === fund.ticker &&
              !existingAccounts.has(changeAccount)
            ) {
              fundTotal += pendingChange;
            }
          });
        }

        return fundAcc + fundTotal;
      }, 0);
    },
    [getEffectiveValue, usePendingValues, pendingChanges],
  );

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
