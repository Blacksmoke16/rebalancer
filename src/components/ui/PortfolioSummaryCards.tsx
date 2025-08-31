import { Card, Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import {
  IconWallet,
  IconTarget,
  IconTrendingDown,
} from "@tabler/icons-react";
import { memo } from "react";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { CurrencyCell } from "./FormatCells";
import commonClasses from "../../styles/common.module.css";

interface SummaryCardProps {
  title: string;
  value: string | React.ReactNode;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  description,
}: SummaryCardProps) {
  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="sm" fw={500} tt="uppercase">
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          {description && (
            <Text c="dimmed" size="xs" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon color={color} size={38} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

export const PortfolioSummaryCards = memo(function PortfolioSummaryCards() {
  const {
    portfolio,
    calculations: { totalDollars, currentPercentage },
  } = usePortfolioContext();

  const totalValue = totalDollars();
  const totalAssetClasses = portfolio.length;
  const totalFunds = portfolio.reduce(
    (sum, assetClass) => sum + assetClass.funds.length,
    0,
  );

  // Calculate portfolio balance metrics
  const assetClassDeltas = portfolio.map((assetClass) => {
    const current = currentPercentage(assetClass) * 100;
    const target = assetClass.allocation;
    return {
      name: assetClass.name,
      delta: current - target,
      absDelta: Math.abs(current - target),
    };
  });

  const mostImbalanced = assetClassDeltas.reduce(
    (max, current) => (current.absDelta > max.absDelta ? current : max),
    { name: "", delta: 0, absDelta: 0 },
  );


  return (
    <SimpleGrid cols={{ base: 1, sm: 3, lg: 3 }} spacing="md" className={commonClasses.centeredGrid}>
      <SummaryCard
        title="Total Portfolio Value"
        value={<CurrencyCell value={totalValue} />}
        icon={<IconWallet size={22} />}
        color="blue"
      />

      <SummaryCard
        title="Asset Classes"
        value={totalAssetClasses.toString()}
        icon={<IconTarget size={22} />}
        color="green"
        description={`${totalFunds} total funds`}
      />

      <SummaryCard
        title="Most Off-Target"
        value={mostImbalanced.name || "None"}
        icon={<IconTrendingDown size={22} />}
        color={mostImbalanced.absDelta < 2 ? "green" : "orange"}
        description={
          mostImbalanced.name
            ? `${mostImbalanced.delta > 0 ? "+" : ""}${mostImbalanced.delta.toFixed(1)}% off target`
            : "All targets met"
        }
      />
    </SimpleGrid>
  );
});
