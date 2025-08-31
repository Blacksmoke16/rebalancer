import { ReactNode } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { usePortfolioCalculations } from '../hooks/usePortfolioCalculations';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { PortfolioContext, PortfolioContextValue } from './PortfolioContext';

interface PortfolioProviderProps {
    children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
    const portfolioData = usePortfolioData();
    const { accounts, portfolio, toInvest, setToInvest, updateAssetAccountValue, resetToDefaults } = portfolioData;
    const calculations = usePortfolioCalculations(portfolio, toInvest);

    const contextValue: PortfolioContextValue = {
        accounts,
        portfolio,
        toInvest,
        calculations,
        updateAssetAccountValue,
        setToInvest,
        resetToDefaults,
    };

    return (
        <ErrorBoundary>
            <PortfolioContext.Provider value={contextValue}>
                {children}
            </PortfolioContext.Provider>
        </ErrorBoundary>
    );
}
