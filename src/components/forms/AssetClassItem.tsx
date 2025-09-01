import { Box, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { AssetClass } from "../../types";
import {
  AssetClassNameInput,
  DeleteButton,
  PercentageInput,
} from "../ui/FormFields";
import { FundsList } from "./FundsList";
import classes from "../AssetClassSettings.module.css";

interface AssetClassItemProps {
  assetClass: AssetClass;
  assetIdx: number;
  form: UseFormReturnType<{ portfolio: AssetClass[] }>;
  onRemove: (index: number) => void;
  onAddFund: (assetClassIndex: number) => void;
  onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
}

export const AssetClassItem = memo<AssetClassItemProps>(
  function AssetClassItem({
    assetClass,
    assetIdx,
    form,
    onRemove,
    onAddFund,
    onRemoveFund,
  }) {
    return (
      <Paper
        key={assetClass.key}
        withBorder
        p="md"
        className={classes.assetClassItem}
      >
        <Stack className={classes.assetClassContent}>
          {/* Asset Class Header with Delete Button */}
          <Group justify="space-between" align="flex-start" mb="sm">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="sm" fw={500} c="dimmed">
                Asset Class
              </Text>

              {/* Mobile Layout - Stack name and percentage */}
              <Stack gap="xs" hiddenFrom="sm">
                <AssetClassNameInput
                  {...form.getInputProps(`portfolio.${assetIdx}.name`)}
                />
                <PercentageInput
                  value={assetClass.allocation}
                  onChange={(value) => {
                    form.setFieldValue(
                      `portfolio.${assetIdx}.allocation`,
                      value,
                    );
                  }}
                />
              </Stack>

              {/* Desktop Layout - Horizontal group */}
              <Group gap="md" visibleFrom="sm">
                <AssetClassNameInput
                  {...form.getInputProps(`portfolio.${assetIdx}.name`)}
                />
                <PercentageInput
                  value={assetClass.allocation}
                  onChange={(value) => {
                    form.setFieldValue(
                      `portfolio.${assetIdx}.allocation`,
                      value,
                    );
                  }}
                />
              </Group>
            </Stack>

            <DeleteButton
              onClick={() => {
                onRemove(assetIdx);
              }}
              aria-label={`Delete entire ${assetClass.name || "asset class"} asset class`}
            />
          </Group>

          <Box
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Title order={5} mb="sm">
              Funds
            </Title>
            <FundsList
              funds={assetClass.funds}
              assetClassIndex={assetIdx}
              form={form}
              onRemoveFund={onRemoveFund}
            />
            <Button
              size="sm"
              className={classes.fundsSection}
              onClick={() => {
                onAddFund(assetIdx);
              }}
            >
              Add Fund
            </Button>
          </Box>
        </Stack>
      </Paper>
    );
  },
);
