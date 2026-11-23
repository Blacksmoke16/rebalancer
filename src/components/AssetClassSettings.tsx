import { Button, Flex, Paper, Title, Text, Stack } from "@mantine/core";
import { AssetClass } from "../types";
import { useAssetClassForm } from "../hooks/useAssetClassForm";
import { AssetClassItem } from "./forms/AssetClassItem";
import { AllocationSummary } from "./forms/AllocationSummary";
import classes from "./AssetClassSettings.module.css";

interface AssetClassSettingsProps {
  portfolio: AssetClass[];
  onPortfolioChange: (portfolio: AssetClass[]) => void;
}

export function AssetClassSettings({
  portfolio,
  onPortfolioChange,
}: AssetClassSettingsProps) {
  const {
    form,
    handleSubmit,
    addAssetClass,
    removeAssetClass,
    addFund,
    removeFund,
    reorderFunds,
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
                onReorderFunds={reorderFunds}
              />
            ))}

            {/* Stacked full-width on mobile, one row from the sm breakpoint */}
            <Flex
              className={classes.actionButtons}
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              gap="sm"
              mt="lg"
            >
              <Button variant="light" onClick={addAssetClass}>
                + Add Asset Class
              </Button>
              <Flex direction={{ base: "column", sm: "row" }} gap="sm">
                <Button
                  variant="default"
                  disabled={!form.isDirty()}
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Discard changes
                </Button>
                <Button
                  disabled={!form.isValid() || !form.isDirty()}
                  type="submit"
                >
                  Save asset classes
                </Button>
              </Flex>
            </Flex>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
