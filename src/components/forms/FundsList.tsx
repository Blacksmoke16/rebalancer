import { Group, TextInput } from "@mantine/core";
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
        <Group key={fund.key} className={classes.fundItem} wrap="nowrap">
          {/* Fills the row on mobile; keeps its natural width from sm up */}
          <TextInput
            placeholder="VTI"
            aria-label="Ticker"
            className={commonClasses.uppercaseInput}
            flex={{ base: 1, sm: "none" }}
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
      ))}
    </>
  );
}
