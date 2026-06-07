import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "../test/utils";
import { usePortfolioData } from "./usePortfolioData";
import { usePortfolioCalculations } from "./usePortfolioCalculations";

// Composes the data and calculation hooks the way the app does, exposing both
// the mutators and the derived per-account totals.
function usePortfolio() {
  const data = usePortfolioData();
  const calculations = usePortfolioCalculations(data.portfolio, data.toInvest);
  return { ...data, calculations };
}

describe("usePortfolioData", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves an account's holdings when it is renamed", async () => {
    const { result } = renderHook(() => usePortfolio());

    // Wait for the default data to load.
    await waitFor(() => {
      expect(result.current.accounts.length).toBeGreaterThan(0);
    });

    const account = result.current.accounts[0];
    const holdingsBefore = result.current.calculations.totalForAccount(
      account.key,
    );
    expect(holdingsBefore).toBeGreaterThan(0);

    // Rename the account, keeping its stable key (what the settings form does).
    act(() => {
      result.current.accountList.setState((accounts) =>
        accounts.map((a) =>
          a.key === account.key ? { ...a, name: `${a.name} (renamed)` } : a,
        ),
      );
    });

    // The renamed account still owns the same holdings.
    expect(result.current.calculations.totalForAccount(account.key)).toBe(
      holdingsBefore,
    );
  });
});
