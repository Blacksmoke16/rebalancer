import { Center, TableTd, TableTr } from "@mantine/core";
import { Fragment } from "react";
import { Account } from "../../types";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { CurrencyCell } from "./FormatCells";

interface AccountTotalsRowProps {
  accounts: Account[];
}

export function AccountTotalsRow({ accounts }: AccountTotalsRowProps) {
  const { analysis } = usePortfolioContext();

  return (
    <Fragment>
      <TableTr>
        <TableTd />
      </TableTr>
      <TableTr>
        <TableTd colSpan={3}>Account Totals</TableTd>
        {accounts.map((account) => (
          <TableTd key={`${account.key}-total`}>
            <Center>
              <CurrencyCell value={analysis.accountTotals[account.key] ?? 0} />
            </Center>
          </TableTd>
        ))}
        <TableTd>
          <CurrencyCell value={analysis.total} align="right" />
        </TableTd>
      </TableTr>
    </Fragment>
  );
}
