import { Paper, ScrollArea, Table, TableTbody, TableTh, TableThead, TableTr } from '@mantine/core';
import { Fragment, memo } from 'react';
import { usePortfolioContext } from '../contexts/PortfolioContext';
import { AccountTotalsRow } from './ui/AccountTotalsRow';
import { AssetClassHeaderRow } from './ui/AssetClassHeaderRow';
import { FundDataRow } from './ui/FundDataRow';

export const PortfolioInputTable = memo(function PortfolioInputTable() {
    const { accounts, portfolio } = usePortfolioContext();
    return (
        <ScrollArea>
            <Paper p="xl" withBorder shadow="sm">
                <Table withColumnBorders withTableBorder>
                    <TableThead>
                        <TableTr>
                            <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Asset Class</TableTh>
                            <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Ticker</TableTh>
                            {accounts.map((account) => (
                                <TableTh key={account.key} style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                    {account.name}
                                </TableTh>
                            ))}
                            <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Asset Class Totals</TableTh>
                        </TableTr>
                    </TableThead>
                    <TableTbody>
                        {portfolio.map((assetClass) => (
                            <Fragment key={assetClass.name}>
                                {assetClass.funds.map((fund, fundIdx) => {
                                    const isFirstFund = fundIdx === 0;
                                    return (
                                        <Fragment key={fund.ticker}>
                                            {isFirstFund && (
                                                <AssetClassHeaderRow 
                                                    assetClass={assetClass} 
                                                    accounts={accounts}
                                                />
                                            )}
                                            <FundDataRow
                                                fund={fund}
                                                assetClass={assetClass}
                                                accounts={accounts}
                                                isFirstFund={isFirstFund}
                                            />
                                        </Fragment>
                                    );
                                })}
                            </Fragment>
                        ))}
                        <AccountTotalsRow accounts={accounts} />
                    </TableTbody>
                </Table>
            </Paper>
        </ScrollArea>
    );
});
