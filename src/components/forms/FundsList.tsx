import { Group, Stack } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { memo } from "react";
import { AssetClass, Fund } from "../../types";
import { DeleteButton, TickerInput } from "../ui/FormFields";
import classes from "../AssetClassSettings.module.css";

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
        <div key={fund.key} className={classes.fundItem}>
          {/* Mobile Layout - Stack vertically */}
          <Stack gap="xs" hiddenFrom="sm">
            <TickerInput
              {...form.getInputProps(
                `portfolio.${assetClassIndex}.funds.${fundIdx}.ticker`,
              )}
            />
            <Group justify="flex-end">
              <DeleteButton
                size="md"
                onClick={() => {
                  onRemoveFund(assetClassIndex, fundIdx);
                }}
                aria-label={`Delete fund ${fund.ticker || "ticker"}`}
              />
            </Group>
          </Stack>

          {/* Desktop Layout - Horizontal group */}
          <Group visibleFrom="sm">
            <TickerInput
              {...form.getInputProps(
                `portfolio.${assetClassIndex}.funds.${fundIdx}.ticker`,
              )}
            />
            <DeleteButton
              size="md"
              onClick={() => {
                onRemoveFund(assetClassIndex, fundIdx);
              }}
              aria-label={`Delete fund ${fund.ticker || "ticker"}`}
            />
          </Group>
        </div>
      ))}
    </>
  );
});
