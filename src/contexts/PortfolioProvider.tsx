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
    enterPlanningMode,
    exitPlanningMode,
    applyPendingChanges,
    resetToDefaults,
    handleDataImport,
    accountList,
    portfolioList,
  } = portfolioData;
  // Pending changes only exist in planning mode; entering, exiting, and
  // applying all clear them.
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
      enterPlanningMode,
      exitPlanningMode,
      applyPendingChanges,
      setToInvest,
      resetToDefaults,
      handleDataImport,
      accountList,
      portfolioList,
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
      enterPlanningMode,
      exitPlanningMode,
      applyPendingChanges,
      setToInvest,
      resetToDefaults,
      handleDataImport,
      accountList,
      portfolioList,
    ],
  );

  return <PortfolioContext value={contextValue}>{children}</PortfolioContext>;
}
