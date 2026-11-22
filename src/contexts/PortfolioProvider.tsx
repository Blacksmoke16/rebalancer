import { ReactNode, useMemo } from "react";
import { usePortfolioData } from "../hooks/usePortfolioData";
import { analyzePortfolio, withPendingChanges } from "../portfolio";
import { PortfolioContext, PortfolioContextValue } from "./PortfolioContext";

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const portfolioData = usePortfolioData();
  const {
    accounts,
    portfolio,
    toInvest,
    planningMode,
    pendingChanges,
    pendingBalance,
    setToInvest,
    updateFundBalance,
    updatePendingChange,
    updateAccounts,
    updatePortfolio,
    enterPlanningMode,
    exitPlanningMode,
    applyPendingChanges,
    resetToDefaults,
    handleDataImport,
  } = portfolioData;
  // Pending changes only exist in planning mode; they're cleared whenever
  // planning mode starts or ends.
  const analysis = useMemo(
    () =>
      analyzePortfolio(withPendingChanges(portfolio, pendingChanges), toInvest),
    [portfolio, pendingChanges, toInvest],
  );

  const contextValue: PortfolioContextValue = useMemo(
    () => ({
      accounts,
      portfolio,
      toInvest,
      planningMode,
      pendingChanges,
      pendingBalance,
      analysis,
      updateFundBalance,
      updatePendingChange,
      updateAccounts,
      updatePortfolio,
      enterPlanningMode,
      exitPlanningMode,
      applyPendingChanges,
      setToInvest,
      resetToDefaults,
      handleDataImport,
    }),
    [
      accounts,
      portfolio,
      toInvest,
      planningMode,
      pendingChanges,
      pendingBalance,
      analysis,
      updateFundBalance,
      updatePendingChange,
      updateAccounts,
      updatePortfolio,
      enterPlanningMode,
      exitPlanningMode,
      applyPendingChanges,
      setToInvest,
      resetToDefaults,
      handleDataImport,
    ],
  );

  return <PortfolioContext value={contextValue}>{children}</PortfolioContext>;
}
