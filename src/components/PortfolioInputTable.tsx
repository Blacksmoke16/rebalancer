import {
  Card,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  TableCaption,
  TableTbody,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { Fragment } from "react";
import { usePortfolioContext } from "../contexts/PortfolioContext";
import { assetClassTotal, fundDollarValues, fundTotal } from "../portfolio";
import { AccountTotalsRow } from "./ui/AccountTotalsRow";
import { AssetClassHeaderRow } from "./ui/AssetClassHeaderRow";
import { FundDataRow } from "./ui/FundDataRow";
import commonClasses from "../styles/common.module.css";
import type { Account, AssetClass } from "../types";

// Mobile Layout Component
function MobilePortfolioLayout({
  portfolio,
  accounts,
}: {
  portfolio: AssetClass[];
  accounts: Account[];
}) {
  return (
    <Stack gap="md" hiddenFrom="md">
      {portfolio.map((assetClass) => (
        <Card key={assetClass.key} withBorder p="md" shadow="sm">
          <Stack gap="sm">
            <Title order={4} size="h5">
              {assetClass.name}
            </Title>
            {assetClass.funds.map((fund) => (
              <Card key={fund.key} withBorder p="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={600}>{fund.ticker}</Text>
                  </Group>
                  {accounts.map((account) => (
                    <Group key={account.key} justify="space-between">
                      <Text size="sm" c="dimmed">
                        {account.name}:
                      </Text>
                      <Text size="sm">
                        $
                        {(
                          fundDollarValues(fund)[account.key] ?? 0
                        ).toLocaleString()}
                      </Text>
                    </Group>
                  ))}
                  <Group
                    justify="space-between"
                    pt="xs"
                    style={{
                      borderTop: "1px solid var(--mantine-color-gray-3)",
                    }}
                  >
                    <Text size="sm" fw={600}>
                      Fund Total:
                    </Text>
                    <Text size="sm" fw={600}>
                      ${fundTotal(fund).toLocaleString()}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            ))}
            <Group
              justify="space-between"
              pt="sm"
              style={{ borderTop: "2px solid var(--mantine-color-blue-6)" }}
            >
              <Text fw={700} c="blue">
                Asset Class Total:
              </Text>
              <Text fw={700} c="blue">
                ${assetClassTotal(assetClass).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

// Desktop Layout Component
function DesktopPortfolioLayout({
  portfolio,
  accounts,
}: {
  portfolio: AssetClass[];
  accounts: Account[];
}) {
  return (
    <ScrollArea visibleFrom="md">
      <Paper p="xl" withBorder shadow="sm">
        <Table withColumnBorders withTableBorder>
          <TableCaption>Holdings by asset class and account</TableCaption>
          <TableThead>
            <TableTr>
              <TableTh className={commonClasses.tableHeader}>
                Asset Class
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>Ticker</TableTh>
              {accounts.map((account) => (
                <TableTh
                  key={account.key}
                  className={commonClasses.tableHeader}
                >
                  {account.name}
                </TableTh>
              ))}
              <TableTh className={commonClasses.tableHeader}>
                Asset Class Totals
              </TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {portfolio.map((assetClass) => (
              <Fragment key={assetClass.key}>
                {assetClass.funds.map((fund, fundIdx) => {
                  const isFirstFund = fundIdx === 0;
                  return (
                    <Fragment key={fund.key}>
                      {isFirstFund && (
                        <AssetClassHeaderRow
                          assetClass={assetClass}
                          accounts={accounts}
                        />
                      )}
                      <FundDataRow
                        fund={fund}
                        assetClass={assetClass}
                        accounts={accounts}
                        isFirstFund={isFirstFund}
                      />
                    </Fragment>
                  );
                })}
              </Fragment>
            ))}
            <AccountTotalsRow accounts={accounts} />
          </TableTbody>
        </Table>
      </Paper>
    </ScrollArea>
  );
}

export function PortfolioInputTable() {
  const { accounts, portfolio } = usePortfolioContext();

  return (
    <>
      <MobilePortfolioLayout portfolio={portfolio} accounts={accounts} />
      <DesktopPortfolioLayout portfolio={portfolio} accounts={accounts} />
    </>
  );
}
