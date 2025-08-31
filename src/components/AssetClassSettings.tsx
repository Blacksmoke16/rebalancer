import { Button, Group, Paper, Title } from '@mantine/core';
import { memo } from 'react';
import { AssetClass } from '../types';
import { useAssetClassForm } from '../hooks/useAssetClassForm';
import { AssetClassItem } from './forms/AssetClassItem';
import { AllocationSummary } from './forms/AllocationSummary';
import classes from './AssetClassSettings.module.css';

interface AssetClassSettingsProps {
    portfolio: AssetClass[];
    onPortfolioChange: (portfolio: AssetClass[]) => void;
}

export const AssetClassSettings = memo<AssetClassSettingsProps>(function AssetClassSettings({ 
    portfolio, 
    onPortfolioChange 
}) {
    const {
        form,
        handleSubmit,
        addAssetClass,
        removeAssetClass,
        addFund,
        removeFund,
        getTotalAllocation,
    } = useAssetClassForm({ portfolio, onPortfolioChange });

    return (
        <Paper shadow="xl" withBorder p="xl" className={classes.container}>
            <Title order={3}>Asset Classes</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                {form.getValues().portfolio.map((assetClass, assetIdx) => (
                    <AssetClassItem
                        key={assetClass.key}
                        assetClass={assetClass}
                        assetIdx={assetIdx}
                        form={form}
                        onRemove={removeAssetClass}
                        onAddFund={addFund}
                        onRemoveFund={removeFund}
                    />
                ))}
                <Group className={classes.actionButtons} justify="space-evenly">
                    <Button onClick={addAssetClass}>
                        Add Asset Class
                    </Button>
                    <Button 
                        disabled={!form.isValid() || !form.isDirty()} 
                        type="submit"
                    >
                        Save
                    </Button>
                </Group>
                <AllocationSummary totalAllocation={getTotalAllocation()} />
            </form>
        </Paper>
    );
});
