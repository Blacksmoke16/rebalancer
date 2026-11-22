import { Stack, TableTd, TableTr, Text } from "@mantine/core";
import { Account, AssetClass, Fund } from "../../types";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { fundDollarValues } from "../../portfolio";
import { NumberField } from "./NumberField";
import classes from "../../App.module.css";

interface FundDataRowProps {
  fund: Fund;
  assetClass: AssetClass;
  accounts: Account[];
  isFirstFund: boolean;
}

export function FundDataRow({
  fund,
  assetClass,
  accounts,
  isFirstFund,
}: FundDataRowProps) {
  const {
    updateFundBalance,
    updatePendingChange,
    planningMode,
    pendingChanges,
  } = usePortfolioContext();
  const dollarValues = fundDollarValues(fund);

  return (
    <TableTr>
      {isFirstFund && <TableTd rowSpan={assetClass.funds.length} />}
      <TableTd>{fund.ticker}</TableTd>
      {accounts.map((account) => {
        const currentValue = dollarValues[account.key] ?? 0;
        const pendingChange = pendingChanges[fund.key]?.[account.key] || 0;
        const projectedValue = currentValue + pendingChange;

        return (
          <TableTd key={account.key}>
            {planningMode ? (
              <Stack gap="xs">
                <NumberField
                  isCurrency
                  allowNegative
                  value={pendingChange === 0 ? "" : pendingChange}
                  placeholder={`Current: $${currentValue.toLocaleString()}`}
                  data-testid={`${fund.ticker}-${account.name}-pending-value`}
                  onValueChange={(value) => {
                    // Cap negative changes to prevent negative balances
                    const cappedValue =
                      value < 0 ? Math.max(value, -currentValue) : value;
                    updatePendingChange(fund.key, account.key, cappedValue);
                  }}
                />
                {pendingChange !== 0 && (
                  <Text size="xs" c="dimmed">
                    Current: ${currentValue.toLocaleString()} → New: $
                    {projectedValue.toLocaleString()}
                  </Text>
                )}
              </Stack>
            ) : (
              <NumberField
                isCurrency
                value={currentValue}
                data-testid={`${fund.ticker}-${account.name}-value`}
                onValueChange={(value) => {
                  updateFundBalance(fund.key, account.key, value);
                }}
              />
            )}
          </TableTd>
        );
      })}
      {isFirstFund && (
        <TableTd
          className={classes.withBorder}
          rowSpan={assetClass.funds.length}
        />
      )}
    </TableTr>
  );
}
