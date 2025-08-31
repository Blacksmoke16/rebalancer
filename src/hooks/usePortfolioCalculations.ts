import { useMemo } from 'react';
import { AssetClass } from '../types';

export function usePortfolioCalculations(portfolio: AssetClass[], toInvest: number) {
    // Memoized calculations that depend on portfolio but not individual asset classes
    const portfolioTotals = useMemo(() => {
        const totalDollars = portfolio.reduce((acc, assetClass) => {
            return acc + assetClass.funds.reduce((fundAcc, fund) => {
                return fundAcc + Object.values(fund.values).reduce((valueAcc, value) => valueAcc + value, 0);
            }, 0);
        }, 0);

        const totalWithInvestment = totalDollars + toInvest;

        return { totalDollars, totalWithInvestment };
    }, [portfolio, toInvest]);

    // Memoized calculation functions
    const calculations = useMemo(() => {
        const currentForAssetClass = (assetClass: AssetClass): number => {
            const matchingAssetClass = portfolio.find(ac => ac.name === assetClass.name);
            if (!matchingAssetClass) return 0;

            return matchingAssetClass.funds.reduce((fundAcc, fund) => {
                return fundAcc + Object.values(fund.values).reduce((valueAcc, value) => valueAcc + value, 0);
            }, 0);
        };

        const currentPercentage = (assetClass: AssetClass): number => {
            return portfolioTotals.totalDollars > 0 
                ? currentForAssetClass(assetClass) / portfolioTotals.totalDollars 
                : 0;
        };

        const targetDollars = (assetClass: AssetClass): number => {
            return portfolioTotals.totalWithInvestment * (assetClass.allocation / 100);
        };

        const amountToBuy = (assetClass: AssetClass): number => {
            if (toInvest <= 0) {
                return 0;
            }

            const deltaDollars = targetDollars(assetClass) - currentForAssetClass(assetClass);

            const positiveDeltaDollars = portfolio.reduce((acc, ac) => {
                const delta = targetDollars(ac) - currentForAssetClass(ac);
                return delta > 0 ? acc + delta : acc;
            }, 0);

            if (positiveDeltaDollars === 0) {
                return 0;
            }

            return Math.max(0, toInvest * (deltaDollars / positiveDeltaDollars));
        };

        return {
            currentForAssetClass,
            currentPercentage,
            targetDollars,
            amountToBuy,
        };
    }, [portfolio, toInvest, portfolioTotals]);

    // Additional utility functions that don't need heavy optimization
    const totalForAccount = (accountName: string): number => {
        return portfolio.reduce((assetAcc, assetClass) => {
            return assetAcc + assetClass.funds.reduce((fundAcc, fund) => {
                return fundAcc + (fund.values[accountName] ?? 0);
            }, 0);
        }, 0);
    };

    const totalForAssetClassAccount = (assetClassName: string, accountName: string): number => {
        const assetClass = portfolio.find(ac => ac.name === assetClassName);
        if (!assetClass) return 0;

        return assetClass.funds.reduce((fundAcc, fund) => {
            return fundAcc + (fund.values[accountName] ?? 0);
        }, 0);
    };

    const totalDollars = (): number => portfolioTotals.totalDollars;

    return {
        ...calculations,
        totalForAccount,
        totalForAssetClassAccount,
        totalDollars,
    };
}