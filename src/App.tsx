import { Box, Stack, Tabs } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { IconChartPie, IconSettings } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountsSettings } from './components/AccountsSettings';
import { AssetClassSettings } from './components/AssetClassSettings';
import { DataManagement } from './components/DataManagement';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortfolioInputTable } from './components/PortfolioInputTable';
import { RebalancingAnalysisTable } from './components/RebalancingAnalysisTable';
import { STORAGE } from './constants';
import { usePortfolioCalculations } from './hooks/usePortfolioCalculations';
import { loadPortfolioData, savePortfolioData } from './storage';
import { Account, AssetClass } from './types';
import { defaultAccounts, defaultAssetClasses } from './utils';



export default function App() {
    // Initialize state with defaults, will be overridden by useEffect if data exists
    const [accounts, accountList] = useListState<Account>(defaultAccounts());
    const [portfolio, portfolioList] = useListState<AssetClass>(defaultAssetClasses());
    const [toInvest, setToInvest] = useState(0);
    
    const [isLoaded, setIsLoaded] = useState(false);

    const calculations = usePortfolioCalculations(portfolio, toInvest);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run on mount

    // Auto-save when data changes
    useEffect(() => {
        if (isLoaded) {
            debouncedSave();
        }
    }, [accounts, portfolio, toInvest, isLoaded, debouncedSave]);

    const updateAssetAccountValue = useCallback((assetClassName: string, fundTicker: string, accountName: string, value: number): void => {
        const assetClassIndex = portfolio.findIndex((p) => p.name === assetClassName);
        if (assetClassIndex === -1) {
            console.error('Failed to find asset class');
            return;
        }

        const assetClass = portfolio[assetClassIndex];
        const fundIndex = assetClass.funds.findIndex((f) => f.ticker === fundTicker);
        if (fundIndex === -1) {
            console.error('Failed to find fund');
            return;
        }

        const updatedAssetClass = {
            ...assetClass,
            funds: assetClass.funds.map((fund, idx) => 
                idx === fundIndex 
                    ? { ...fund, values: { ...fund.values, [accountName]: value } }
                    : fund
            )
        };

        portfolioList.setItem(assetClassIndex, updatedAssetClass);
    }, [portfolio, portfolioList]);

    const handleDataImport = useCallback((newAccounts: Account[], newPortfolio: AssetClass[], newToInvest: number): void => {
        accountList.setState(newAccounts);
        portfolioList.setState(newPortfolio);
        setToInvest(newToInvest);
        // Immediately save the imported data to localStorage
        savePortfolioData(newAccounts, newPortfolio, newToInvest);
    }, [accountList, portfolioList]);

    return (
        <ErrorBoundary>
            <Box p="xl">
                <Tabs defaultValue="portfolio">
                    <Tabs.List>
                        <Tabs.Tab value="portfolio" leftSection={<IconChartPie size={16} />}>
                            Portfolio
                        </Tabs.Tab>
                        <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
                            Settings
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="portfolio">
                        <Stack mt="xl">
                            <ErrorBoundary>
                                <PortfolioInputTable
                                    accounts={accounts}
                                    portfolio={portfolio}
                                    onValueChange={updateAssetAccountValue}
                                    totalForAccount={calculations.totalForAccount}
                                    totalForAssetClassAccount={calculations.totalForAssetClassAccount}
                                    currentForAssetClass={calculations.currentForAssetClass}
                                />
                            </ErrorBoundary>
                            
                            <ErrorBoundary>
                                <RebalancingAnalysisTable
                                    portfolio={portfolio}
                                    toInvest={toInvest}
                                    onToInvestChange={setToInvest}
                                    currentPercentage={calculations.currentPercentage}
                                    targetDollars={calculations.targetDollars}
                                    currentForAssetClass={calculations.currentForAssetClass}
                                    amountToBuy={calculations.amountToBuy}
                                    totalDollars={calculations.totalDollars}
                                />
                            </ErrorBoundary>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="settings">
                        <Stack mt="xl">
                            <ErrorBoundary>
                                <AccountsSettings
                                    accounts={accounts}
                                    onAccountsChange={accountList.setState}
                                />
                            </ErrorBoundary>
                            
                            <ErrorBoundary>
                                <AssetClassSettings
                                    portfolio={portfolio}
                                    onPortfolioChange={portfolioList.setState}
                                />
                            </ErrorBoundary>
                            
                            <ErrorBoundary>
                                <DataManagement
                                    accounts={accounts}
                                    portfolio={portfolio}
                                    toInvest={toInvest}
                                    onDataImported={handleDataImport}
                                />
                            </ErrorBoundary>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Box>
        </ErrorBoundary>
    );
}

