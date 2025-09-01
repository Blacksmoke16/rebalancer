import type {
  AccountId,
  AssetClassId,
  DollarAmount,
  FundTicker,
  Percentage,
} from "./types/branded";

export interface Account {
  name: string;
  key: AccountId;
}

export type AccountBalances = Record<string, DollarAmount>;

export interface Fund {
  ticker: FundTicker;
  values: AccountBalances;
  key: string;
}

export interface AssetClass {
  name: string;
  allocation: Percentage;
  funds: Fund[];
  key: AssetClassId;
}

export interface PortfolioData {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  version: string;
  lastSaved: string;
}

export type DeltaCellType = "currency" | "percentage";

export type AlignmentType = "left" | "right" | "center";
