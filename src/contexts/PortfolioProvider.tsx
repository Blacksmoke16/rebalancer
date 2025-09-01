import { ReactNode, useMemo } from "react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { usePortfolioCalculations } from "../hooks/usePortfolioCalculations";
import { usePortfolioData } from "../hooks/usePortfolioData";
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
    setToInvest,
    updateAssetAccountValue,
    resetToDefaults,
    handleDataImport,
    accountList,
    portfolioList,
  } = portfolioData;
  const calculations = usePortfolioCalculations(portfolio, toInvest);

  const contextValue: PortfolioContextValue = useMemo(
    () => ({
      accounts,
      portfolio,
      toInvest,
      calculations,
      updateAssetAccountValue,
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
      calculations,
      updateAssetAccountValue,
      setToInvest,
      resetToDefaults,
      handleDataImport,
      accountList,
      portfolioList,
    ],
  );

  return (
    <ErrorBoundary>
      <PortfolioContext value={contextValue}>{children}</PortfolioContext>
    </ErrorBoundary>
  );
}
