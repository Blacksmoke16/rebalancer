import { Stack, TableTd, TableTr, Text } from "@mantine/core";
import { Account, AssetClass, Fund } from "../../types";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { fundDollarValues } from "../../portfolio";
import { formatDollars, formatShareChange } from "../../utils/format";
import { FundPriceCell } from "./FundPriceCell";
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
  // Planned changes are in dollars, so planning a share fund needs its price.
  const price = fund.unit === "shares" ? fund.price : null;
  const canPlan = fund.unit === "dollars" || Boolean(price);

  return (
    <TableTr>
      {isFirstFund && <TableTd rowSpan={assetClass.funds.length} />}
      <TableTd>{fund.ticker}</TableTd>
      <TableTd>
        <FundPriceCell fund={fund} />
      </TableTd>
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
                  disabled={!canPlan}
                  value={pendingChange === 0 ? "" : pendingChange}
                  placeholder={
                    canPlan
                      ? `Current: ${formatDollars(currentValue)}`
                      : "Needs a price"
                  }
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
                    Current: {formatDollars(currentValue)} → New:{" "}
                    {formatDollars(projectedValue)}
                    {price
                      ? ` (≈ ${formatShareChange(pendingChange / price)} shares)`
                      : null}
                  </Text>
                )}
              </Stack>
            ) : (
              <Stack gap={4}>
                {/* Dollars for a dollar fund; a share count for a share fund */}
                <NumberField
                  isCurrency={fund.unit === "dollars"}
                  allowDecimal={fund.unit === "shares"}
                  decimalScale={6}
                  value={
                    fund.unit === "shares"
                      ? (fund.shares[account.key] ?? 0)
                      : currentValue
                  }
                  data-testid={`${fund.ticker}-${account.name}-value`}
                  onValueChange={(value) => {
                    updateFundBalance(fund.key, account.key, value);
                  }}
                />
                {fund.unit === "shares" && (
                  <Text size="xs" c="dimmed">
                    ≈ {formatDollars(currentValue)}
                  </Text>
                )}
              </Stack>
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
