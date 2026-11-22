import { Group, Stack, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { AssetClass, Fund } from "../../types";
import { DeleteButton } from "../ui/FormFields";
import classes from "../AssetClassSettings.module.css";
import commonClasses from "../../styles/common.module.css";

interface FundsListProps {
  funds: Fund[];
  assetClassIndex: number;
  form: UseFormReturnType<{ portfolio: AssetClass[] }>;
  onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
}

export function FundsList({
  funds,
  assetClassIndex,
  form,
  onRemoveFund,
}: FundsListProps) {
  return (
    <>
      {funds.map((fund, fundIdx) => (
        <div key={fund.key} className={classes.fundItem}>
          {/* Mobile Layout - Stack vertically */}
          <Stack gap="xs" hiddenFrom="sm">
            <TextInput
              placeholder="VTI"
              className={commonClasses.uppercaseInput}
              {...form.getInputProps(
                `portfolio.${assetClassIndex}.funds.${fundIdx}.ticker`,
              )}
              data-testid={`fund-ticker-${assetClassIndex}-${fundIdx}`}
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
            <TextInput
              placeholder="VTI"
              className={commonClasses.uppercaseInput}
              {...form.getInputProps(
                `portfolio.${assetClassIndex}.funds.${fundIdx}.ticker`,
              )}
              data-testid={`fund-ticker-${assetClassIndex}-${fundIdx}`}
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
}
