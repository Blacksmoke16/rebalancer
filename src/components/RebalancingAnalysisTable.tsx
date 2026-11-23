import {
  Card,
  Center,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  TableCaption,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
  Title,
} from "@mantine/core";
import { usePortfolioContext } from "../contexts/PortfolioContext";
import { soleShareFundPrice, type AssetClassAnalysis } from "../portfolio";
import { CurrencyCell, DeltaCell, PercentageCell } from "./ui/FormatCells";
import { NumberField } from "./ui/NumberField";
import { createDollarAmount } from "../types/branded";
import { formatShares } from "../utils/format";
import classes from "./RebalancingAnalysisTable.module.css";
import commonClasses from "../styles/common.module.css";
import type { AssetClass } from "../types";

interface AssetCalculation extends AssetClassAnalysis {
  assetClass: AssetClass;
  // Set when the asset class holds a single priced share fund.
  sharePrice: number | null;
}

// The amount to buy in shares, when there's a single share fund to buy.
function SharesToBuy({
  toBuy,
  sharePrice,
}: Pick<AssetCalculation, "toBuy" | "sharePrice">) {
  if (!sharePrice || toBuy <= 0) {
    return null;
  }
  return (
    <Text size="xs" c="dimmed">
      ≈ {formatShares(toBuy / sharePrice)} shares
    </Text>
  );
}

// Mobile Layout Component
function MobileRebalanceLayout({
  assetCalculations,
  toInvest,
  handleToInvestChange,
}: {
  assetCalculations: AssetCalculation[];
  toInvest: number;
  handleToInvestChange: (value: number) => void;
}) {
  return (
    <Stack gap="md" hiddenFrom="md">
      {/* Investment Amount Card */}
      <Card withBorder p="md" shadow="sm">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">
            💰 Amount to Invest
          </Text>
          <NumberField
            isCurrency
            value={toInvest}
            onValueChange={handleToInvestChange}
            size="md"
          />
        </Group>
      </Card>

      {/* Asset Class Cards */}
      {assetCalculations.map(
        ({
          assetClass,
          current,
          currentPercent,
          toBuy,
          projectedPercent,
          sharePrice,
        }) => (
          <Card key={assetClass.key} withBorder p="md" shadow="sm">
            <Stack gap="sm">
              <Title order={4} size="h5">
                {assetClass.name}
              </Title>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Current:
                </Text>
                <Text size="sm">
                  <PercentageCell value={currentPercent} />
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Target:
                </Text>
                <Text size="sm" fw={600}>
                  <PercentageCell value={assetClass.allocation} />
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  Current Value:
                </Text>
                <Text size="sm">
                  <CurrencyCell value={current} />
                </Text>
              </Group>

              <Group
                justify="space-between"
                pt="xs"
                style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
              >
                <Text size="sm" fw={600} c="green">
                  Amount to Buy:
                </Text>
                <Stack gap={0} align="flex-end">
                  <Text size="sm" fw={700} c="green">
                    <CurrencyCell value={toBuy} />
                  </Text>
                  <SharesToBuy toBuy={toBuy} sharePrice={sharePrice} />
                </Stack>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  After Investment:
                </Text>
                <Text size="sm">
                  <PercentageCell value={projectedPercent} />
                </Text>
              </Group>
            </Stack>
          </Card>
        ),
      )}
    </Stack>
  );
}

// Desktop Layout Component
function DesktopRebalanceLayout({
  assetCalculations,
  toInvest,
  handleToInvestChange,
}: {
  assetCalculations: AssetCalculation[];
  toInvest: number;
  handleToInvestChange: (value: number) => void;
}) {
  return (
    <ScrollArea visibleFrom="md">
      <Paper shadow="sm" withBorder p="xl">
        <Table withColumnBorders withTableBorder>
          <TableCaption>
            Shows current vs target allocation and where to invest new funds
          </TableCaption>
          <TableThead>
            <TableTr>
              <TableTh className={commonClasses.tableHeader}>
                Asset Class
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Current (%)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Target (%)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Current ($)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Target ($)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>Delta (%)</TableTh>
              <TableTh className={commonClasses.tableHeader}>Delta ($)</TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Projected (%)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Projected ($)
              </TableTh>
              <TableTh className={commonClasses.tableHeader}>
                Amount to Buy
              </TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr className={classes.investRow}>
              <TableTd className={classes.investLabel}>
                💰 Amount to Invest
              </TableTd>
              <TableTd colSpan={9}>
                <Center>
                  <NumberField
                    isCurrency
                    value={toInvest}
                    onValueChange={handleToInvestChange}
                    size="md"
                    className={classes.investField}
                  />
                </Center>
              </TableTd>
            </TableTr>
            {assetCalculations.map(
              ({
                assetClass,
                current,
                target,
                currentPercent,
                toBuy,
                projected,
                projectedPercent,
                deltaPercent,
                deltaDollars,
                sharePrice,
              }) => (
                <TableTr key={assetClass.key}>
                  <TableTd>{assetClass.name}</TableTd>
                  <TableTd>
                    <PercentageCell value={currentPercent} />
                  </TableTd>
                  <TableTd>
                    <PercentageCell value={assetClass.allocation} />
                  </TableTd>
                  <TableTd>
                    <CurrencyCell value={current} />
                  </TableTd>
                  <TableTd>
                    <CurrencyCell value={target} />
                  </TableTd>
                  <TableTd>
                    <DeltaCell value={deltaPercent} type="percentage" />
                  </TableTd>
                  <TableTd>
                    <DeltaCell value={deltaDollars} type="currency" />
                  </TableTd>
                  <TableTd>
                    <PercentageCell value={projectedPercent} />
                  </TableTd>
                  <TableTd>
                    <CurrencyCell value={projected} />
                  </TableTd>
                  <TableTd>
                    <CurrencyCell value={toBuy} />
                    <SharesToBuy toBuy={toBuy} sharePrice={sharePrice} />
                  </TableTd>
                </TableTr>
              ),
            )}
          </TableTbody>
        </Table>
      </Paper>
    </ScrollArea>
  );
}

export function RebalancingAnalysisTable() {
  const { portfolio, toInvest, setToInvest, analysis } = usePortfolioContext();

  function handleToInvestChange(value: number) {
    setToInvest(createDollarAmount(value));
  }

  const assetCalculations = portfolio.map((assetClass) => ({
    assetClass,
    ...analysis.assetClasses[assetClass.key],
    sharePrice: soleShareFundPrice(assetClass),
  }));

  return (
    <>
      <MobileRebalanceLayout
        assetCalculations={assetCalculations}
        toInvest={toInvest}
        handleToInvestChange={handleToInvestChange}
      />
      <DesktopRebalanceLayout
        assetCalculations={assetCalculations}
        toInvest={toInvest}
        handleToInvestChange={handleToInvestChange}
      />
    </>
  );
}
