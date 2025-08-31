import { Center, Group, NumberFormatter, Paper, ScrollArea, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { Fragment } from 'react';
import { FORMATTING } from '../constants';
import { Account, AssetClass } from '../types';
import { NumberField } from './ui/NumberField';
import classes from '../App.module.css';

interface PortfolioInputTableProps {
    accounts: Account[];
    portfolio: AssetClass[];
    onValueChange: (assetClassName: string, fundTicker: string, accountName: string, value: number) => void;
    totalForAccount: (accountName: string) => number;
    totalForAssetClassAccount: (assetClassName: string, accountName: string) => number;
    currentForAssetClass: (assetClass: AssetClass) => number;
}

export function PortfolioInputTable({ 
    accounts, 
    portfolio, 
    onValueChange,
    totalForAccount,
    totalForAssetClassAccount,
    currentForAssetClass
}: PortfolioInputTableProps) {
    return (
        <ScrollArea>
            <Paper p="xl" withBorder>
                <Table withColumnBorders withTableBorder>
                    <TableThead>
                        <TableTr>
                            <TableTh>Asset Class</TableTh>
                            <TableTh>Ticker</TableTh>
                            {accounts.map((account) => (
                                <TableTh key={account.key}>{account.name}</TableTh>
                            ))}
                            <TableTh>Asset Class Totals</TableTh>
                        </TableTr>
                    </TableThead>
                    <TableTbody>
                        {portfolio.map((assetClass) => (
                            <Fragment key={assetClass.name}>
                                {assetClass.funds.map((fund, fundIdx) => {
                                    return (
                                        <Fragment key={fund.ticker}>
                                            {
                                                fundIdx === 0 && (
                                                    <>
                                                        <TableTr>
                                                            <TableTd/>
                                                        </TableTr>
                                                        <TableTr>
                                                            <TableTd>
                                                                {assetClass.name}
                                                            </TableTd>
                                                            <TableTd/>
                                                            {accounts.map((account) => (
                                                                <TableTd key={`${assetClass.name}-${account.key}-total`}>
                                                                    <Center>
                                                                        <NumberFormatter 
                                                            prefix={FORMATTING.DOLLAR_PREFIX} 
                                                            thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} 
                                                            value={totalForAssetClassAccount(assetClass.name, account.name)}
                                                        />
                                                                    </Center>
                                                                </TableTd>
                                                            ))}
                                                            <TableTd>
                                                                <Group justify="flex-end">
                                                                    <NumberFormatter 
                                                                        prefix={FORMATTING.DOLLAR_PREFIX} 
                                                                        thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} 
                                                                        value={currentForAssetClass(assetClass)}
                                                                    />
                                                                </Group>
                                                            </TableTd>
                                                        </TableTr>
                                                    </>
                                                )
                                            }
                                            <TableTr>
                                                {fundIdx === 0 && (
                                                    <TableTd rowSpan={assetClass.funds.length}/>
                                                )}
                                                <TableTd>{fund.ticker}</TableTd>
                                                {accounts.map((account) => (
                                                    <TableTd key={account.key}>
                                                        <NumberField
                                                            isCurrency
                                                            value={fund.values[account.name] || 0}
                                                            onValueChange={(value) => {
                                                                onValueChange(
                                                                    assetClass.name,
                                                                    fund.ticker,
                                                                    account.name,
                                                                    value,
                                                                );
                                                            }}
                                                        />
                                                    </TableTd>
                                                ))}
                                                {fundIdx === 0 && (
                                                    <TableTd className={classes.withBorder} rowSpan={assetClass.funds.length}/>
                                                )}
                                            </TableTr>
                                        </Fragment>
                                    );
                                })}
                            </Fragment>
                        ))}
                        <TableTr>
                            <TableTd/>
                        </TableTr>
                        <TableTr>
                            <TableTd colSpan={2}>
                                Account Totals
                            </TableTd>
                            {accounts.map((account) => (
                                <TableTd key={`${account.key}-total`}>
                                    <Center>
                                        <NumberFormatter 
                                            prefix={FORMATTING.DOLLAR_PREFIX} 
                                            thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} 
                                            value={totalForAccount(account.name)}
                                        />
                                    </Center>
                                </TableTd>
                            ))}
                            <TableTd/>
                        </TableTr>
                    </TableTbody>
                </Table>
            </Paper>
        </ScrollArea>
    );
}