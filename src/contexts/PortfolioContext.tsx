import { useListState } from "@mantine/hooks";
import { createContext, use } from "react";
import { PortfolioAnalysis } from "../portfolio";
import { Account, AssetClass, PendingChanges } from "../types";
import { AccountId, DollarAmount } from "../types/branded";

export interface PortfolioContextValue {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  planningMode: boolean;
  pendingChanges: PendingChanges;
  pendingBalance: number;
  // Analysis of the portfolio with any pending changes applied.
  analysis: PortfolioAnalysis;
  updateFundBalance: (
    fundKey: string,
    accountId: AccountId,
    value: number,
  ) => void;
  updatePendingChange: (
    fundKey: string,
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
