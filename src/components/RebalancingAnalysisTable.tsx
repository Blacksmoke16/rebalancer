import { Center, NumberFormatter, Paper, Table, TableTd, TableTh, TableThead, TableTr, Text } from '@mantine/core';
import { DELTA_COLORS, FORMATTING } from '../constants';
import { AssetClass } from '../types';
import { NumberField } from './ui/NumberField';

interface RebalancingAnalysisTableProps {
    portfolio: AssetClass[];
    toInvest: number;
    onToInvestChange: (value: number) => void;
    currentPercentage: (assetClass: AssetClass) => number;
    targetDollars: (assetClass: AssetClass) => number;
    currentForAssetClass: (assetClass: AssetClass) => number;
    amountToBuy: (assetClass: AssetClass) => number;
    totalDollars: () => number;
}

export function RebalancingAnalysisTable({ 
    portfolio,
    toInvest,
    onToInvestChange,
    currentPercentage,
    targetDollars,
    currentForAssetClass,
    amountToBuy,
    totalDollars
}: RebalancingAnalysisTableProps) {
    const getDeltaColor = (value: number) => {
        if (value > 0) return DELTA_COLORS.POSITIVE;
        if (value < 0) return DELTA_COLORS.NEGATIVE;
        return DELTA_COLORS.NEUTRAL;
    };

    return (
        <Paper shadow="xl" withBorder p="xl">
            <Table withColumnBorders withTableBorder>
                <TableThead>
                    <TableTr>
                        <TableTh>Asset Class</TableTh>
                        <TableTh>Target (%)</TableTh>
                        <TableTh>Current (%)</TableTh>
                        <TableTh>Target ($)</TableTh>
                        <TableTh>Current ($)</TableTh>
                        <TableTh>Delta (%)</TableTh>
                        <TableTh>Delta ($)</TableTh>
                        <TableTh>Projected (%)</TableTh>
                        <TableTh>Projected ($)</TableTh>
                        <TableTh>Amount to Buy</TableTh>
                    </TableTr>
                    <TableTr>
                        <TableTd>To Invest</TableTd>
                        <TableTd colSpan={9}>
                            <Center>
                                <NumberField
                                    isCurrency
                                    value={toInvest}
                                    onValueChange={onToInvestChange}
                                />
                            </Center>
                        </TableTd>
                    </TableTr>
                    {
                        portfolio.map((assetClass) => {
                            return (
                                <TableTr key={assetClass.name}>
                                    <TableTd>{assetClass.name}</TableTd>
                                    <TableTd>
                                        <NumberFormatter 
                                            suffix={FORMATTING.PERCENT_SUFFIX} 
                                            value={assetClass.allocation} 
                                            decimalScale={FORMATTING.DECIMAL_PLACES.PERCENTAGE}
                                        />
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter suffix={FORMATTING.PERCENT_SUFFIX} value={currentPercentage(assetClass) * 100} decimalScale={FORMATTING.DECIMAL_PLACES.PERCENTAGE}/>
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter prefix={FORMATTING.DOLLAR_PREFIX} thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} value={targetDollars(assetClass)} decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}/>
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter prefix={FORMATTING.DOLLAR_PREFIX} thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} value={
                                            currentForAssetClass(assetClass)
                                        } decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}/>
                                    </TableTd>
                                    <TableTd>
                                        {(() => {
                                            const deltaPercent = (currentPercentage(assetClass) * 100) - assetClass.allocation;
                                            return (
                                                <Text c={getDeltaColor(deltaPercent)}>
                                                    <NumberFormatter 
                                                        suffix={FORMATTING.PERCENT_SUFFIX} 
                                                        value={deltaPercent} 
                                                        decimalScale={FORMATTING.DECIMAL_PLACES.PERCENTAGE}
                                                        allowNegative
                                                    />
                                                </Text>
                                            );
                                        })()}
                                    </TableTd>
                                    <TableTd>
                                        {(() => {
                                            const deltaDollars = targetDollars(assetClass) - currentForAssetClass(assetClass);
                                            return (
                                                <Text c={getDeltaColor(deltaDollars)}>
                                                    <NumberFormatter 
                                                        prefix={FORMATTING.DOLLAR_PREFIX} 
                                                        thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} 
                                                        allowNegative 
                                                        value={deltaDollars}
                                                        decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}
                                                    />
                                                </Text>
                                            );
                                        })()}
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter prefix={FORMATTING.DOLLAR_PREFIX} thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} value={
                                            currentForAssetClass(assetClass) + amountToBuy(assetClass)
                                        } decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}/>
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter suffix={FORMATTING.PERCENT_SUFFIX} value={(((currentForAssetClass(assetClass) + amountToBuy(assetClass)) / (totalDollars() + toInvest)) * 100) || 0} decimalScale={FORMATTING.DECIMAL_PLACES.PERCENTAGE}/>
                                    </TableTd>
                                    <TableTd>
                                        <NumberFormatter prefix={FORMATTING.DOLLAR_PREFIX} thousandSeparator={FORMATTING.THOUSAND_SEPARATOR} value={amountToBuy(assetClass)} decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}/>
                                    </TableTd>
                                </TableTr>
                            );
                        })
                    }
                </TableThead>
            </Table>
        </Paper>
    );
}