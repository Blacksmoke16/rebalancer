import type {
  Account,
  AccountBalances,
  AccountShares,
  AssetClass,
  DollarFund,
  Fund,
  PendingChanges,
  ShareFund,
} from "./types";
import type { Quote } from "./prices";
import {
  AccountId,
  AssetClassId,
  createDollarAmount,
  createShareCount,
} from "./types/branded";

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

// Dollar value of the fund in each account. Share funds are valued at shares
// times price; an unpriced share fund is worth $0.
export function fundDollarValues(
  fund: Fund,
): Partial<Record<AccountId, number>> {
  if (fund.unit === "dollars") return fund.values;

  const price = fund.price ?? 0;
  const values: Partial<Record<AccountId, number>> = {};
  for (const [accountId, shares] of Object.entries(fund.shares)) {
    values[accountId as AccountId] = shares * price;
  }
  return values;
}

// Converts a dollar fund to shares at the given price, which becomes the fund's
// price.
export function toShareFund(
  fund: DollarFund,
  price: number,
  priceAsOf: string,
): ShareFund {
  if (!(price > 0)) {
    throw new Error(`Invalid price: ${price}. Must be positive.`);
  }

  const shares: AccountShares = {};
  for (const [accountId, value] of Object.entries(fund.values)) {
    shares[accountId as AccountId] = createShareCount(value / price);
  }
  return {
    ticker: fund.ticker,
    key: fund.key,
    unit: "shares",
    shares,
    price,
    priceAsOf,
  };
}

// Converts a share fund to dollars at its price, rounding each holding to whole
// dollars.
export function toDollarFund(fund: ShareFund): DollarFund {
  if (!fund.price) {
    throw new Error(`${fund.ticker} has no price to convert its shares with.`);
  }

  const values: AccountBalances = {};
  for (const [accountId, value] of Object.entries(fundDollarValues(fund))) {
    values[accountId as AccountId] = createDollarAmount(value ?? 0);
  }
  return { ticker: fund.ticker, key: fund.key, unit: "dollars", values };
}

export function fundTotal(fund: Fund): number {
  return Object.values(fundDollarValues(fund)).reduce<number>(
    (sum, value) => sum + (value ?? 0),
    0,
  );
}

export function assetClassTotal(assetClass: AssetClass): number {
  return assetClass.funds.reduce((sum, fund) => sum + fundTotal(fund), 0);
}

// Returns a copy of the portfolio with each non-zero pending change added to
// the matching fund's balance in that account. Changes are in dollars, so share
// funds gain or lose `change / price` shares.
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

      if (fund.unit === "shares") {
        // Dollars can't be converted into shares without a price.
        if (!fund.price) return fund;

        const shares = { ...fund.shares };
        for (const [accountId, change] of changes) {
          const id = accountId as AccountId;
          shares[id] = createShareCount(
            (shares[id] ?? 0) + change / fund.price,
          );
        }
        return { ...fund, shares };
      }

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
  function heldInAccounts<T>(
    holdings: Record<AccountId, T>,
  ): Record<AccountId, T> {
    return Object.fromEntries(
      Object.entries(holdings).filter(([accountId]) =>
        accountIds.has(accountId),
      ),
    );
  }

  return portfolio.map((assetClass) => ({
    ...assetClass,
    funds: assetClass.funds.map((fund): Fund =>
      fund.unit === "shares"
        ? { ...fund, shares: heldInAccounts(fund.shares) }
        : { ...fund, values: heldInAccounts(fund.values) },
    ),
  }));
}

// The price of an asset class's only fund, when that's a priced share fund, so
// a dollar amount for the asset class can be shown in shares. With several
// funds there's no single fund to buy, so this is null.
export function soleShareFundPrice(assetClass: AssetClass): number | null {
  if (assetClass.funds.length !== 1) return null;
  const [fund] = assetClass.funds;
  return fund.unit === "shares" ? fund.price : null;
}

// Prices older than this may no longer reflect what a fund is worth.
const STALE_PRICE_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Whether a price dated `priceAsOf` is over a week old at `now` (milliseconds
// since the epoch).
export function isPriceStale(priceAsOf: string, now: number): boolean {
  return now - new Date(priceAsOf).getTime() > STALE_PRICE_AGE_MS;
}

// The symbols to look up prices for: each share fund's ticker, uppercased, once.
export function shareFundSymbols(portfolio: AssetClass[]): string[] {
  const symbols = portfolio
    .flatMap((assetClass) => assetClass.funds)
    .filter((fund) => fund.unit === "shares")
    .map((fund) => fund.ticker.toUpperCase());
  return [...new Set(symbols)];
}

// Returns a copy of the portfolio with each quote's price set on the share
// funds whose ticker matches its symbol, ignoring case.
export function withPrices(
  portfolio: AssetClass[],
  quotes: Map<string, Quote>,
): AssetClass[] {
  return portfolio.map((assetClass) => ({
    ...assetClass,
    funds: assetClass.funds.map((fund) => {
      const quote =
        fund.unit === "shares" ? quotes.get(fund.ticker.toUpperCase()) : null;
      if (!quote) return fund;
      return { ...fund, price: quote.price, priceAsOf: quote.asOf };
    }),
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
      addAccountTotals(accountTotals, fundDollarValues(fund));
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
