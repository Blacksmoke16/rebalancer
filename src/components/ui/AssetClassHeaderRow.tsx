import { Center, TableTd, TableTr } from "@mantine/core";
import { Fragment, memo } from "react";
import { Account, AssetClass } from "../../types";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { CurrencyCell } from "./FormatCells";
import styles from "./AssetClassHeaderRow.module.css";

interface AssetClassHeaderRowProps {
  assetClass: AssetClass;
  accounts: Account[];
}

export const AssetClassHeaderRow = memo<AssetClassHeaderRowProps>(
  function AssetClassHeaderRow({ assetClass, accounts }) {
    const { analysis } = usePortfolioContext();
    const { accountTotals, current } = analysis.assetClasses[assetClass.key];

    return (
      <Fragment>
        <TableTr>
          <TableTd />
        </TableTr>
        <TableTr className={styles.headerRow}>
          <TableTd>
            <div className={styles.assetClassName}>{assetClass.name}</div>
          </TableTd>
          <TableTd />
          {accounts.map((account) => (
            <TableTd key={account.key}>
              <Center>
                <div className={styles.totalCell}>
                  <CurrencyCell value={accountTotals[account.key] ?? 0} />
                </div>
              </Center>
            </TableTd>
          ))}
          <TableTd>
            <div className={styles.totalCell}>
              <CurrencyCell value={current} align="right" />
            </div>
          </TableTd>
        </TableTr>
      </Fragment>
    );
  },
);
