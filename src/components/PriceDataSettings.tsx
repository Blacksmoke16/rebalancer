import {
  Anchor,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useApiKey } from "../hooks/useApiKey";

export function PriceDataSettings() {
  const [apiKey, setApiKey] = useApiKey();

  return (
    <Paper shadow="sm" withBorder p="xl">
      <Stack gap="md">
        <div>
          <Title order={3}>Price Data</Title>
          <Text size="sm" c="dimmed" mt="xs">
            Refresh share fund prices from financeapi.net with your own API key.
            A free key allows 100 requests a day, and each refresh uses one
            request per 10 share funds.{" "}
            <Anchor
              href="https://financeapi.net/tutorial"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get a free key
            </Anchor>
          </Text>
        </div>

        <PasswordInput
          label="API key"
          value={apiKey}
          autoComplete="off"
          onChange={(event) => {
            setApiKey(event.currentTarget.value.trim());
          }}
        />

        <Text size="xs" c="dimmed">
          Your key is stored only in this browser and is never included in
          exported backups. Refreshing sends your share funds' tickers to
          financeapi.net. Any script running on this site can read the key, so
          use one you'd be comfortable replacing.
        </Text>
      </Stack>
    </Paper>
  );
}
