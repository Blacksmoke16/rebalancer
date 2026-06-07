import { useListState } from "@mantine/hooks";
import { createContext, use } from "react";
import { PendingChanges } from "../hooks/usePortfolioData";
import { Account, AssetClass } from "../types";
import { AccountId, DollarAmount } from "../types/branded";

export interface CalculationMethods {
  totalForAccount: (accountId: AccountId) => number;
  totalForAssetClassAccount: (
    assetClassName: string,
    accountId: AccountId,
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
  planningMode: boolean;
  pendingChanges: PendingChanges;
  pendingBalance: number;
  calculations: CalculationMethods;
  updateAssetAccountValue: (
    assetClassName: string,
    fundTicker: string,
    accountId: AccountId,
    value: number,
  ) => void;
  updatePendingChange: (
    assetClassName: string,
    fundTicker: string,
    accountId: AccountId,
    changeAmount: number,
  ) => void;
  enterPlanningMode: () => void;
  exitPlanningMode: () => void;
  applyPendingChanges: () => void;
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
