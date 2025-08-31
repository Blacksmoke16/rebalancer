import { createContext, useContext } from 'react';
import { Account, AssetClass } from '../types';

export interface CalculationMethods {
    totalForAccount: (accountName: string) => number;
    totalForAssetClassAccount: (assetClassName: string, accountName: string) => number;
    currentForAssetClass: (assetClass: AssetClass) => number;
    totalDollars: () => number;
    currentPercentage: (assetClass: AssetClass) => number;
    targetDollars: (assetClass: AssetClass) => number;
    amountToBuy: (assetClass: AssetClass) => number;
}

export interface PortfolioContextValue {
    accounts: Account[];
    portfolio: AssetClass[];
    toInvest: number;
    calculations: CalculationMethods;
    updateAssetAccountValue: (assetClassName: string, fundTicker: string, accountName: string, value: number) => void;
    setToInvest: (value: number) => void;
    resetToDefaults: () => void;
}

export const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

export function usePortfolioContext(): PortfolioContextValue {
    const context = useContext(PortfolioContext);
    if (!context) {
        throw new Error('usePortfolioContext must be used within a PortfolioProvider');
    }
    return context;
}
