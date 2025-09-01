import { Button, Group, Paper, Title, Text, Stack } from "@mantine/core";
import { memo } from "react";
import { AssetClass } from "../types";
import { useAssetClassForm } from "../hooks/useAssetClassForm";
import { AssetClassItem } from "./forms/AssetClassItem";
import { AllocationSummary } from "./forms/AllocationSummary";
import classes from "./AssetClassSettings.module.css";

interface AssetClassSettingsProps {
  portfolio: AssetClass[];
  onPortfolioChange: (portfolio: AssetClass[]) => void;
}

export const AssetClassSettings = memo<AssetClassSettingsProps>(
  function AssetClassSettings({ portfolio, onPortfolioChange }) {
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
      <Paper shadow="sm" withBorder p="xl" className={classes.container}>
        <Stack gap="lg">
          <div>
            <Title order={3}>Asset Classes & Target Allocation</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Define your asset classes, target allocation percentages, and the
              funds within each class. Total allocation must equal 100%.
            </Text>
          </div>

          <AllocationSummary totalAllocation={getTotalAllocation()} />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {form.values.portfolio.map((assetClass, assetIdx) => (
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

              {/* Mobile Layout - Stack buttons vertically */}
              <Stack gap="sm" hiddenFrom="sm" mt="lg">
                <Button variant="light" onClick={addAssetClass} fullWidth>
                  + Add Asset Class
                </Button>
                <Button
                  disabled={!form.isValid() || !form.isDirty()}
                  type="submit"
                  fullWidth
                >
                  Save Changes
                </Button>
              </Stack>

              {/* Desktop Layout - Horizontal button group */}
              <Group
                className={classes.actionButtons}
                justify="space-between"
                mt="lg"
                visibleFrom="sm"
              >
                <Button variant="light" onClick={addAssetClass}>
                  + Add Asset Class
                </Button>
                <Button
                  disabled={!form.isValid() || !form.isDirty()}
                  type="submit"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    );
  },
);
