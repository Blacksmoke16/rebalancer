import type { Account, AssetClass, Fund, PendingChanges } from "./types";
import { AccountId, AssetClassId, createDollarAmount } from "./types/branded";

export interface AssetClassAnalysis {
  current: number;
  // Percentages are on a 0-100 scale, like AssetClass.allocation.
  currentPercent: number;
  // Dollars this asset class should hold once the amount to invest is added.
  target: number;
  deltaPercent: number;
  deltaDollars: number;
  toBuy: number;
  projected: number;
  projectedPercent: number;
  accountTotals: Partial<Record<AccountId, number>>;
}

export interface PortfolioAnalysis {
  total: number;
  accountTotals: Partial<Record<AccountId, number>>;
  assetClasses: Record<AssetClassId, AssetClassAnalysis>;
}

export function fundTotal(fund: Fund): number {
  return Object.values(fund.values).reduce((sum, value) => sum + value, 0);
}

export function assetClassTotal(assetClass: AssetClass): number {
  return assetClass.funds.reduce((sum, fund) => sum + fundTotal(fund), 0);
}

// Returns a copy of the portfolio with each non-zero pending change added to
// the matching fund's balance in that account.
export function withPendingChanges(
  portfolio: AssetClass[],
  pendingChanges: PendingChanges,
): AssetClass[] {
  return portfolio.map((assetClass) => ({
    ...assetClass,
    funds: assetClass.funds.map((fund) => {
      const changes = Object.entries(pendingChanges[fund.key] ?? {}).filter(
        ([, change]) => change !== 0,
      );
      if (changes.length === 0) return fund;

      const values = { ...fund.values };
      for (const [accountId, change] of changes) {
        const id = accountId as AccountId;
        values[id] = createDollarAmount((values[id] ?? 0) + change);
      }
      return { ...fund, values };
    }),
  }));
}

// Returns a copy of the portfolio keeping only the balances held in the given
// accounts, dropping any left behind by accounts that were deleted.
export function withoutOrphanedBalances(
  portfolio: AssetClass[],
  accounts: Account[],
): AssetClass[] {
  const accountIds = new Set<string>(accounts.map((account) => account.key));
  return portfolio.map((assetClass) => ({
    ...assetClass,
    funds: assetClass.funds.map((fund) => ({
      ...fund,
      values: Object.fromEntries(
        Object.entries(fund.values).filter(([accountId]) =>
          accountIds.has(accountId),
        ),
      ),
    })),
  }));
}

function addAccountTotals(
  totals: Partial<Record<AccountId, number>>,
  balances: Partial<Record<AccountId, number>>,
): void {
  for (const [accountId, value] of Object.entries(balances)) {
    const id = accountId as AccountId;
    totals[id] = (totals[id] ?? 0) + (value ?? 0);
  }
}

// Computes current holdings, target allocation, and how to split `toInvest`
// across asset classes: new money goes only to under-allocated asset classes,
// in proportion to how far each is below its target.
export function analyzePortfolio(
  portfolio: AssetClass[],
  toInvest: number,
): PortfolioAnalysis {
  const holdings = portfolio.map((assetClass) => {
    const accountTotals: Partial<Record<AccountId, number>> = {};
    for (const fund of assetClass.funds) {
      addAccountTotals(accountTotals, fund.values);
    }
    return { assetClass, accountTotals, current: assetClassTotal(assetClass) };
  });

  const total = holdings.reduce((sum, { current }) => sum + current, 0);
  const totalWithInvestment = total + toInvest;
  const targetFor = (assetClass: AssetClass) =>
    totalWithInvestment * (assetClass.allocation / 100);
  const totalShortfall = holdings.reduce(
    (sum, { assetClass, current }) =>
      sum + Math.max(0, targetFor(assetClass) - current),
    0,
  );

  const accountTotals: Partial<Record<AccountId, number>> = {};
  const assetClasses = {} as Record<AssetClassId, AssetClassAnalysis>;
  for (const holding of holdings) {
    const { assetClass, current } = holding;
    addAccountTotals(accountTotals, holding.accountTotals);

    const target = targetFor(assetClass);
    const deltaDollars = target - current;
    const toBuy =
      toInvest > 0 && totalShortfall > 0
        ? Math.max(0, toInvest * (deltaDollars / totalShortfall))
        : 0;
    const currentPercent = total > 0 ? (current / total) * 100 : 0;
    const projected = current + toBuy;

    assetClasses[assetClass.key] = {
      current,
      currentPercent,
      target,
      deltaPercent: currentPercent - assetClass.allocation,
      deltaDollars,
      toBuy,
      projected,
      projectedPercent:
        totalWithInvestment > 0 ? (projected / totalWithInvestment) * 100 : 0,
      accountTotals: holding.accountTotals,
    };
  }

  return { total, accountTotals, assetClasses };
}
