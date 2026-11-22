import { Alert, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { usePortfolioContext } from "../../contexts/PortfolioContext";

// Share funds are valued at shares times price, so one without a price counts
// as $0 until it gets one.
export function UnpricedFundsAlert() {
  const { portfolio } = usePortfolioContext();
  const unpricedTickers = portfolio
    .flatMap((assetClass) => assetClass.funds)
    .filter((fund) => fund.unit === "shares" && !fund.price)
    .map((fund) => fund.ticker);

  if (unpricedTickers.length === 0) {
    return null;
  }

  return (
    <Alert
      icon={<IconAlertTriangle size={20} />}
      title="Missing prices"
      color="yellow"
    >
      <Text>
        These share funds count as $0 until you enter a price in the Price
        column: {unpricedTickers.join(", ")}
      </Text>
    </Alert>
  );
}
