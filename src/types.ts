import type { AccountId, AssetClassId, DollarAmount } from "./types/branded";

export interface Account {
  name: string;
  key: AccountId;
}

export type AccountBalances = Record<AccountId, DollarAmount>;

export interface Fund {
  ticker: string;
  values: AccountBalances;
  key: string;
}

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
  version: string;
  lastSaved: string;
}

export type DeltaCellType = "currency" | "percentage";

export type AlignmentType = "left" | "right" | "center";
