import { Group } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { memo } from 'react';
import { AssetClass, Fund } from '../../types';
import { DeleteButton, TickerInput } from '../ui/FormFields';
import classes from '../AssetClassSettings.module.css';

interface FundsListProps {
    funds: Fund[];
    assetClassIndex: number;
    form: UseFormReturnType<{ portfolio: AssetClass[] }>;
    onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
}

export const FundsList = memo<FundsListProps>(function FundsList({
    funds,
    assetClassIndex,
    form,
    onRemoveFund,
}) {
    return (
        <>
            {funds.map((fund, fundIdx) => (
                <Group key={fund.key} className={classes.fundItem}>
                    <TickerInput
                        {...form.getInputProps(`portfolio.${assetClassIndex}.funds.${fundIdx}.ticker`)}
                    />
                    <DeleteButton
                        size="md"
                        onClick={() => { onRemoveFund(assetClassIndex, fundIdx); }}
                        aria-label={`Delete fund ${fund.ticker || 'ticker'}`}
                    />
                </Group>
            ))}
        </>
    );
});