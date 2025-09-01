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
    const {
      calculations: { totalForAssetClassAccount, currentForAssetClass },
    } = usePortfolioContext();

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
            <TableTd key={`${assetClass.name}-${account.key}-total`}>
              <Center>
                <div className={styles.totalCell}>
                  <CurrencyCell
                    value={totalForAssetClassAccount(
                      assetClass.name,
                      account.name,
                    )}
                  />
                </div>
              </Center>
            </TableTd>
          ))}
          <TableTd>
            <div className={styles.totalCell}>
              <CurrencyCell
                value={currentForAssetClass(assetClass)}
                align="right"
              />
            </div>
          </TableTd>
        </TableTr>
      </Fragment>
    );
  },
);
