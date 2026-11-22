import type {
  AccountId,
  AssetClassId,
  DollarAmount,
  ShareCount,
} from "./types/branded";

export interface Account {
  name: string;
  key: AccountId;
}

export type AccountBalances = Record<AccountId, DollarAmount>;
export type AccountShares = Record<AccountId, ShareCount>;

interface FundBase {
  ticker: string;
  key: string;
}

// A fund whose holdings are tracked as a dollar balance in each account.
export interface DollarFund extends FundBase {
  unit: "dollars";
  values: AccountBalances;
}

// A fund whose holdings are tracked as a number of shares in each account,
// valued at the fund's price.
export interface ShareFund extends FundBase {
  unit: "shares";
  shares: AccountShares;
  // Dollars per share, with cents; null until a price is set.
  price: number | null;
  // ISO timestamp of the quote or manual entry the price came from.
  priceAsOf: string | null;
}

export type Fund = DollarFund | ShareFund;
export type FundUnit = Fund["unit"];

export interface AssetClass {
  name: string;
  // 0-100
  allocation: number;
  funds: Fund[];
  key: AssetClassId;
}

// Planned buys (positive) and sells (negative) in dollars, keyed by fund key
// and then by account id.
export type PendingChanges = Record<string, Record<AccountId, number>>;

export interface PortfolioData {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  // ISO timestamp of the last price refresh that priced at least one fund.
  pricesUpdatedAt: string | null;
  version: string;
  lastSaved: string;
}

export type DeltaCellType = "currency" | "percentage";

export type AlignmentType = "left" | "right" | "center";
