import { Alert, Anchor, Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { usePortfolioContext } from "../../contexts/PortfolioContext";
import { useApiKey } from "../../hooks/useApiKey";
import { shareFundSymbols } from "../../portfolio";
import {
  describePriceError,
  describeRefresh,
  fetchQuotes,
  PriceError,
} from "../../prices";
import { formatDateTime } from "../../utils/format";

interface PricesCalloutProps {
  onOpenSettings: () => void;
}

// When share fund prices were last refreshed, with the button that refreshes
// them. Shown once any fund tracks shares. Refreshing needs an API key, and is
// unavailable while planning since prices are locked then.
export function PricesCallout({ onOpenSettings }: PricesCalloutProps) {
  const { portfolio, pricesUpdatedAt, planningMode, applyQuotes } =
    usePortfolioContext();
  const [apiKey] = useApiKey();
  const [refreshing, setRefreshing] = useState(false);
  const symbols = shareFundSymbols(portfolio);

  if (symbols.length === 0) {
    return null;
  }

  async function refreshPrices(): Promise<void> {
    setRefreshing(true);
    try {
      const results = await fetchQuotes(symbols, apiKey);
      applyQuotes(results.quotes);
      const { title, message, color } = describeRefresh(results);
      notifications.show({ title, message, color });
    } catch (error) {
      notifications.show({
        title: "Couldn't refresh prices",
        message:
          error instanceof PriceError
            ? describePriceError(error)
            : "Something went wrong. Try again.",
        color: "red",
      });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Alert color="blue" icon={<IconRefresh size={20} />}>
      <Group justify="space-between">
        <Text>
          {pricesUpdatedAt
            ? `Prices last updated ${formatDateTime(pricesUpdatedAt)}`
            : "Prices haven't been refreshed yet."}
        </Text>
        <Button
          variant="light"
          size="xs"
          onClick={() => {
            void refreshPrices();
          }}
          disabled={!apiKey || planningMode}
          loading={refreshing}
        >
          Refresh prices
        </Button>
      </Group>
      {!apiKey && (
        <Text size="sm" c="dimmed" mt="xs">
          To refresh prices, add an API key in{" "}
          <Anchor component="button" size="sm" onClick={onOpenSettings}>
            Settings → Price data
          </Anchor>
          . Until then, enter prices in the Price column.
        </Text>
      )}
      {apiKey && planningMode && (
        <Text size="sm" c="dimmed" mt="xs">
          Exit planning to refresh prices.
        </Text>
      )}
    </Alert>
  );
}
