import { TableTd, TableTr } from "@mantine/core";
import { memo } from "react";
import { Account, AssetClass, Fund } from "../../types";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { NumberField } from "./NumberField";
import classes from "../../App.module.css";

interface FundDataRowProps {
  fund: Fund;
  assetClass: AssetClass;
  accounts: Account[];
  isFirstFund: boolean;
}

export const FundDataRow = memo<FundDataRowProps>(function FundDataRow({
  fund,
  assetClass,
  accounts,
  isFirstFund,
}) {
  const { updateAssetAccountValue } = usePortfolioContext();

  return (
    <TableTr>
      {isFirstFund && <TableTd rowSpan={assetClass.funds.length} />}
      <TableTd>{fund.ticker}</TableTd>
      {accounts.map((account) => (
        <TableTd key={account.key}>
          <NumberField
            isCurrency
            value={fund.values[account.name] || 0}
            onValueChange={(value) => {
              updateAssetAccountValue(
                assetClass.name,
                fund.ticker,
                account.name,
                value,
              );
            }}
          />
        </TableTd>
      ))}
      {isFirstFund && (
        <TableTd
          className={classes.withBorder}
          rowSpan={assetClass.funds.length}
        />
      )}
    </TableTr>
  );
});
