import { Center, TableTd, TableTr } from '@mantine/core';
import { Fragment, memo } from 'react';
import { Account } from '../../types';
import { usePortfolioContext } from '../../contexts/PortfolioContext';
import { CurrencyCell } from './FormatCells';

interface AccountTotalsRowProps {
    accounts: Account[];
}

export const AccountTotalsRow = memo<AccountTotalsRowProps>(function AccountTotalsRow({ accounts }) {
    const { calculations: { totalForAccount, totalDollars } } = usePortfolioContext();

    return (
        <Fragment>
            <TableTr>
                <TableTd/>
            </TableTr>
            <TableTr>
                <TableTd colSpan={2}>
                    Account Totals
                </TableTd>
                {accounts.map((account) => (
                    <TableTd key={`${account.key}-total`}>
                        <Center>
                            <CurrencyCell value={totalForAccount(account.name)} />
                        </Center>
                    </TableTd>
                ))}
                <TableTd>
                    <CurrencyCell value={totalDollars()} align="right" />
                </TableTd>
            </TableTr>
        </Fragment>
    );
});
