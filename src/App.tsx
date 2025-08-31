import { Box, Stack, Tabs } from '@mantine/core';
import { IconChartPie, IconSettings } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PortfolioInputTable } from './components/PortfolioInputTable';
import { RebalancingAnalysisTable } from './components/RebalancingAnalysisTable';
import { SettingsErrorBoundary } from './components/SettingsErrorBoundary';
import { SettingsLoadingSkeleton } from './components/ui/LoadingSkeleton';
import { PortfolioProvider } from './contexts/PortfolioProvider';
import { usePortfolioData } from './hooks/usePortfolioData';

// Lazy load settings components for better initial load performance
const AccountsSettings = lazy(() => import('./components/AccountsSettings').then(m => ({ default: m.AccountsSettings })));
const AssetClassSettings = lazy(() => import('./components/AssetClassSettings').then(m => ({ default: m.AssetClassSettings })));
const DataManagement = lazy(() => import('./components/DataManagement').then(m => ({ default: m.DataManagement })));



export default function App() {
    const portfolioData = usePortfolioData();
    const { accounts, portfolio, handleDataImport, accountList, portfolioList } = portfolioData;

    return (
        <ErrorBoundary>
            <PortfolioProvider>
                <Box component="main" p="xl">
                    <Tabs defaultValue="portfolio">
                        <Tabs.List role="tablist" aria-label="Portfolio management sections">
                            <Tabs.Tab 
                                value="portfolio" 
                                leftSection={<IconChartPie size={16} aria-hidden="true" />}
                                role="tab"
                            >
                                Portfolio
                            </Tabs.Tab>
                            <Tabs.Tab 
                                value="settings" 
                                leftSection={<IconSettings size={16} aria-hidden="true" />}
                                role="tab"
                            >
                                Settings
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="portfolio" role="tabpanel" aria-labelledby="portfolio-tab">
                            <Stack component="section" mt="xl" aria-label="Portfolio management">
                                <PortfolioInputTable />
                                <RebalancingAnalysisTable />
                            </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="settings" role="tabpanel" aria-labelledby="settings-tab">
                            <Stack component="section" mt="xl" aria-label="Application settings">
                                <SettingsErrorBoundary>
                                    <Suspense fallback={<SettingsLoadingSkeleton />}>
                                        <AccountsSettings
                                            accounts={accounts}
                                            onAccountsChange={accountList.setState}
                                        />
                                        <AssetClassSettings
                                            portfolio={portfolio}
                                            onPortfolioChange={portfolioList.setState}
                                        />
                                        <DataManagement
                                            onDataImported={handleDataImport}
                                        />
                                    </Suspense>
                                </SettingsErrorBoundary>
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                </Box>
            </PortfolioProvider>
        </ErrorBoundary>
    );
}

