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
import { memo, useMemo, useCallback } from "react";
import { usePortfolioContext } from "../contexts/PortfolioContext";
import { CurrencyCell, DeltaCell, PercentageCell } from "./ui/FormatCells";
import { NumberField } from "./ui/NumberField";
import { createDollarAmount } from "../types/branded";
import classes from "./RebalancingAnalysisTable.module.css";
import commonClasses from "../styles/common.module.css";
import type { AssetClass } from "../types";

interface AssetCalculation {
  assetClass: AssetClass;
  current: number;
  target: number;
  currentPercent: number;
  toBuy: number;
  projected: number;
  projectedPercent: number;
  deltaPercent: number;
  deltaDollars: number;
}

// Mobile Layout Component
const MobileRebalanceLayout = memo(function MobileRebalanceLayout({
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
        ({ assetClass, current, currentPercent, toBuy, projectedPercent }) => (
          <Card key={assetClass.name} withBorder p="md" shadow="sm">
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
                <Text size="sm" fw={700} c="green">
                  <CurrencyCell value={toBuy} />
                </Text>
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
});

// Desktop Layout Component
const DesktopRebalanceLayout = memo(function DesktopRebalanceLayout({
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
              }) => (
                <TableTr key={assetClass.name}>
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
                  </TableTd>
                </TableTr>
              ),
            )}
          </TableTbody>
        </Table>
      </Paper>
    </ScrollArea>
  );
});

export const RebalancingAnalysisTable = memo(
  function RebalancingAnalysisTable() {
    const {
      portfolio,
      toInvest,
      setToInvest,
      calculations: {
        currentPercentage,
        targetDollars,
        currentForAssetClass,
        amountToBuy,
        totalDollars,
      },
    } = usePortfolioContext();

    const handleToInvestChange = useCallback(
      (value: number) => {
        setToInvest(createDollarAmount(value));
      },
      [setToInvest],
    );

    // Pre-calculate values for all asset classes to avoid repeated function calls
    const assetCalculations = useMemo(() => {
      const totalPortfolioValue = totalDollars() + toInvest;

      return portfolio.map((assetClass) => {
        const current = currentForAssetClass(assetClass);
        const target = targetDollars(assetClass);
        const currentPercent = currentPercentage(assetClass) * 100;
        const toBuy = amountToBuy(assetClass);
        const projected = current + toBuy;
        const projectedPercent =
          totalPortfolioValue > 0 ? (projected / totalPortfolioValue) * 100 : 0;

        return {
          assetClass,
          current,
          target,
          currentPercent,
          toBuy,
          projected,
          projectedPercent,
          deltaPercent: currentPercent - assetClass.allocation,
          deltaDollars: target - current,
        };
      });
    }, [
      portfolio,
      currentForAssetClass,
      targetDollars,
      currentPercentage,
      amountToBuy,
      totalDollars,
      toInvest,
    ]);

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
  },
);
