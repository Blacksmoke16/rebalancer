import { useListState } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { STORAGE } from '../constants';
import { loadPortfolioData, savePortfolioData } from '../storage';
import { Account, AssetClass } from '../types';
import { defaultAccounts, defaultAssetClasses } from '../utils';

interface UsePortfolioDataReturn {
    accounts: Account[];
    portfolio: AssetClass[];
    toInvest: number;
    updateAssetAccountValue: (assetClassName: string, fundTicker: string, accountName: string, value: number) => void;
    handleDataImport: (newAccounts: Account[], newPortfolio: AssetClass[], newToInvest: number) => void;
    resetToDefaults: () => void;
    setToInvest: (value: number) => void;
    accountList: ReturnType<typeof useListState<Account>>[1];
    portfolioList: ReturnType<typeof useListState<AssetClass>>[1];
}

export function usePortfolioData(): UsePortfolioDataReturn {
    // Initialize state with defaults, will be overridden by useEffect if data exists
    const [accounts, accountList] = useListState<Account>(defaultAccounts());
    const [portfolio, portfolioList] = useListState<AssetClass>(defaultAssetClasses());
    const [toInvest, setToInvest] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Debounced save function to avoid excessive localStorage writes
    const debouncedSave = useMemo(() => {
        let timeoutId: number;
        return () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                savePortfolioData(accounts, portfolio, toInvest);
            }, STORAGE.AUTO_SAVE_DELAY_MS);
        };
    }, [accounts, portfolio, toInvest]);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedData = loadPortfolioData();
        if (savedData) {
            accountList.setState(savedData.accounts);
            portfolioList.setState(savedData.portfolio);
            setToInvest(savedData.toInvest);
        }
        setIsLoaded(true);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save when data changes
    useEffect(() => {
        if (isLoaded) {
            debouncedSave();
        }
    }, [accounts, portfolio, toInvest, isLoaded, debouncedSave]);

    const updateAssetAccountValue = useCallback((assetClassName: string, fundTicker: string, accountName: string, value: number): void => {
        portfolioList.setState(prev => prev.map(assetClass => {
            if (assetClass.name !== assetClassName) return assetClass;
            
            return {
                ...assetClass,
                funds: assetClass.funds.map(fund => {
                    if (fund.ticker !== fundTicker) return fund;
                    
                    return {
                        ...fund,
                        values: { ...fund.values, [accountName]: value }
                    };
                })
            };
        }));
    }, [portfolioList]);

    const handleDataImport = useCallback((newAccounts: Account[], newPortfolio: AssetClass[], newToInvest: number): void => {
        accountList.setState(newAccounts);
        portfolioList.setState(newPortfolio);
        setToInvest(newToInvest);
        // Immediately save the imported data to localStorage
        savePortfolioData(newAccounts, newPortfolio, newToInvest);
    }, [accountList, portfolioList]);

    const resetToDefaults = useCallback((): void => {
        const defaultAccountsList = defaultAccounts();
        const defaultPortfolioList = defaultAssetClasses();
        const defaultToInvestValue = 0;
        
        accountList.setState(defaultAccountsList);
        portfolioList.setState(defaultPortfolioList);
        setToInvest(defaultToInvestValue);
        
        // Save the reset state immediately
        savePortfolioData(defaultAccountsList, defaultPortfolioList, defaultToInvestValue);
    }, [accountList, portfolioList]);

    return {
        // State
        accounts,
        portfolio,
        toInvest,
        
        // Actions
        updateAssetAccountValue,
        handleDataImport,
        resetToDefaults,
        setToInvest,
        
        // List state handlers
        accountList,
        portfolioList,
    };
}
