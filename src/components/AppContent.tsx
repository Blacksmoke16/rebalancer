import { Box, Stack, Tabs } from '@mantine/core';
import { IconChartPie, IconSettings } from '@tabler/icons-react';
import { lazy, Suspense } from 'react';
import { PortfolioInputTable } from './PortfolioInputTable';
import { RebalancingAnalysisTable } from './RebalancingAnalysisTable';
import { SettingsErrorBoundary } from './SettingsErrorBoundary';
import { SettingsLoadingSkeleton } from './ui/LoadingSkeleton';
import { usePortfolioContext } from '../contexts/PortfolioContext';

// Lazy load settings components for better initial load performance
const AccountsSettings = lazy(() => import('./AccountsSettings').then(m => ({ default: m.AccountsSettings })));
const AssetClassSettings = lazy(() => import('./AssetClassSettings').then(m => ({ default: m.AssetClassSettings })));
const DataManagement = lazy(() => import('./DataManagement').then(m => ({ default: m.DataManagement })));

export function AppContent() {
    const { accounts, portfolio, handleDataImport, accountList, portfolioList } = usePortfolioContext();

    return (
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
    );
}