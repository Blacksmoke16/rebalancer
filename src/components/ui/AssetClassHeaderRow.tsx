import { Center, TableTd, TableTr } from '@mantine/core';
import { Fragment, memo } from 'react';
import { Account, AssetClass } from '../../types';
import { usePortfolioContext } from '../../contexts/PortfolioContext';
import { CurrencyCell } from './FormatCells';

interface AssetClassHeaderRowProps {
    assetClass: AssetClass;
    accounts: Account[];
}

export const AssetClassHeaderRow = memo<AssetClassHeaderRowProps>(function AssetClassHeaderRow({ assetClass, accounts }) {
    const { calculations: { totalForAssetClassAccount, currentForAssetClass } } = usePortfolioContext();

    return (
        <Fragment>
            <TableTr>
                <TableTd/>
            </TableTr>
            <TableTr>
                <TableTd>
                    {assetClass.name}
                </TableTd>
                <TableTd/>
                {accounts.map((account) => (
                    <TableTd key={`${assetClass.name}-${account.key}-total`}>
                        <Center>
                            <CurrencyCell value={totalForAssetClassAccount(assetClass.name, account.name)} />
                        </Center>
                    </TableTd>
                ))}
                <TableTd>
                    <CurrencyCell value={currentForAssetClass(assetClass)} align="right" />
                </TableTd>
            </TableTr>
        </Fragment>
    );
});
