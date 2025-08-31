import { Center, Paper, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from '@mantine/core';
import { memo, useMemo, useCallback } from 'react';
import { usePortfolioContext } from '../contexts/PortfolioContext';
import { CurrencyCell, DeltaCell, PercentageCell } from './ui/FormatCells';
import { NumberField } from './ui/NumberField';
import { createDollarAmount } from '../types/branded';

export const RebalancingAnalysisTable = memo(function RebalancingAnalysisTable() {
    const { 
        portfolio,
        toInvest,
        setToInvest,
        calculations: {
            currentPercentage,
            targetDollars,
            currentForAssetClass,
            amountToBuy,
            totalDollars
        }
    } = usePortfolioContext();

    const handleToInvestChange = useCallback((value: number) => {
        setToInvest(createDollarAmount(value));
    }, [setToInvest]);

    // Pre-calculate values for all asset classes to avoid repeated function calls
    const assetCalculations = useMemo(() => {
        const totalPortfolioValue = totalDollars() + toInvest;
        
        return portfolio.map(assetClass => {
            const current = currentForAssetClass(assetClass);
            const target = targetDollars(assetClass);
            const currentPercent = currentPercentage(assetClass) * 100;
            const toBuy = amountToBuy(assetClass);
            const projected = current + toBuy;
            const projectedPercent = totalPortfolioValue > 0 ? (projected / totalPortfolioValue) * 100 : 0;
            
            return {
                assetClass,
                current,
                target,
                currentPercent,
                toBuy,
                projected,
                projectedPercent,
                deltaPercent: currentPercent - assetClass.allocation,
                deltaDollars: target - current,
            };
        });
    }, [portfolio, currentForAssetClass, targetDollars, currentPercentage, amountToBuy, totalDollars, toInvest]);

    return (
        <Paper shadow="sm" withBorder p="xl">
            <Table withColumnBorders withTableBorder>
                <TableThead>
                    <TableTr>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Asset Class</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Target (%)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Current (%)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Target ($)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Current ($)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Delta (%)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Delta ($)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Projected ($)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Projected (%)</TableTh>
                        <TableTh style={{ fontWeight: 600, fontSize: '0.875rem' }}>Amount to Buy</TableTh>
                    </TableTr>
                </TableThead>
                <TableTbody>
                    <TableTr style={{ backgroundColor: 'var(--mantine-color-blue-0)' }}>
                        <TableTd style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--mantine-color-blue-7)' }}>
                            💰 Amount to Invest
                        </TableTd>
                        <TableTd colSpan={9}>
                            <Center>
                                <NumberField
                                    isCurrency
                                    value={toInvest}
                                    onValueChange={handleToInvestChange}
                                    size="md"
                                    style={{ 
                                        maxWidth: '200px',
                                        fontWeight: 600
                                    }}
                                />
                            </Center>
                        </TableTd>
                    </TableTr>
                    {assetCalculations.map(({ 
                        assetClass, 
                        current, 
                        target, 
                        currentPercent, 
                        toBuy, 
                        projected, 
                        projectedPercent, 
                        deltaPercent, 
                        deltaDollars 
                    }) => (
                        <TableTr key={assetClass.name}>
                            <TableTd>{assetClass.name}</TableTd>
                            <TableTd>
                                <PercentageCell value={assetClass.allocation} />
                            </TableTd>
                            <TableTd>
                                <PercentageCell value={currentPercent} />
                            </TableTd>
                            <TableTd>
                                <CurrencyCell value={target} />
                            </TableTd>
                            <TableTd>
                                <CurrencyCell value={current} />
                            </TableTd>
                            <TableTd>
                                <DeltaCell value={deltaPercent} type="percentage" />
                            </TableTd>
                            <TableTd>
                                <DeltaCell value={deltaDollars} type="currency" />
                            </TableTd>
                            <TableTd>
                                <CurrencyCell value={projected} />
                            </TableTd>
                            <TableTd>
                                <PercentageCell value={projectedPercent} />
                            </TableTd>
                            <TableTd>
                                <CurrencyCell value={toBuy} />
                            </TableTd>
                        </TableTr>
                    ))}
                </TableTbody>
            </Table>
        </Paper>
    );
});
