import { useLocalStorage } from "@mantine/hooks";

// The user's financeapi.net API key. It's kept in its own localStorage entry,
// apart from the portfolio data, so exported backups never include it. Read
// during the first render so the refresh button doesn't flash disabled.
export function useApiKey() {
  return useLocalStorage({
    key: "rebalancer-api-key",
    defaultValue: "",
    getInitialValueInEffect: false,
  });
}
