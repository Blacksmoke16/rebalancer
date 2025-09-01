import { useListState } from "@mantine/hooks";
import { createContext, use } from "react";
import { Account, AssetClass } from "../types";
import { DollarAmount } from "../types/branded";

export interface CalculationMethods {
  totalForAccount: (accountName: string) => number;
  totalForAssetClassAccount: (
    assetClassName: string,
    accountName: string,
  ) => number;
  currentForAssetClass: (assetClass: AssetClass) => number;
  totalDollars: () => number;
  currentPercentage: (assetClass: AssetClass) => number;
  targetDollars: (assetClass: AssetClass) => number;
  amountToBuy: (assetClass: AssetClass) => number;
}

export interface PortfolioContextValue {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  calculations: CalculationMethods;
  updateAssetAccountValue: (
    assetClassName: string,
    fundTicker: string,
    accountName: string,
    value: number,
  ) => void;
  setToInvest: (value: DollarAmount) => void;
  resetToDefaults: () => void;
  handleDataImport: (
    newAccounts: Account[],
    newPortfolio: AssetClass[],
    newToInvest: DollarAmount,
  ) => void;
  accountList: ReturnType<typeof useListState<Account>>[1];
  portfolioList: ReturnType<typeof useListState<AssetClass>>[1];
}

export const PortfolioContext = createContext<
  PortfolioContextValue | undefined
>(undefined);

export function usePortfolioContext(): PortfolioContextValue {
  const context = use(PortfolioContext);
  if (!context) {
    throw new Error(
      "usePortfolioContext must be used within a PortfolioProvider",
    );
  }
  return context;
}
