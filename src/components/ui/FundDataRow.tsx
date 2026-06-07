import { Stack, TableTd, TableTr, Text } from "@mantine/core";
import { memo } from "react";
import { Account, AssetClass, Fund } from "../../types";
import { AccountId } from "../../types/branded";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { NumberField } from "./NumberField";
import classes from "../../App.module.css";

interface FundDataRowProps {
  fund: Fund;
  assetClass: AssetClass;
  accounts: Account[];
  isFirstFund: boolean;
}

function getPendingChangeKey(
  assetClassName: string,
  fundTicker: string,
  accountId: AccountId,
): string {
  return `${assetClassName}|${fundTicker}|${accountId}`;
}

export const FundDataRow = memo<FundDataRowProps>(function FundDataRow({
  fund,
  assetClass,
  accounts,
  isFirstFund,
}) {
  const {
    updateAssetAccountValue,
    updatePendingChange,
    planningMode,
    pendingChanges,
  } = usePortfolioContext();

  return (
    <TableTr>
      {isFirstFund && <TableTd rowSpan={assetClass.funds.length} />}
      <TableTd>{fund.ticker}</TableTd>
      {accounts.map((account) => {
        const currentValue = fund.values[account.key] || 0;
        const pendingChangeKey = getPendingChangeKey(
          assetClass.name,
          fund.ticker,
          account.key,
        );
        const pendingChange = pendingChanges[pendingChangeKey] || 0;
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
                      value < 0
                        ? Math.max(value, -(currentValue as number))
                        : value;
                    updatePendingChange(
                      assetClass.name,
                      fund.ticker,
                      account.key,
                      cappedValue,
                    );
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
                  updateAssetAccountValue(
                    assetClass.name,
                    fund.ticker,
                    account.key,
                    value,
                  );
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
});
