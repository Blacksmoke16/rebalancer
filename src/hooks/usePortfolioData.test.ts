import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "../test/utils";
import { analyzePortfolio } from "../portfolio";
import { usePortfolioData } from "./usePortfolioData";

// Composes the data hook with the portfolio analysis the way the app does,
// exposing both the mutators and the derived per-account totals.
function usePortfolio() {
  const data = usePortfolioData();
  const analysis = analyzePortfolio(data.portfolio, data.toInvest);
  return { ...data, analysis };
}

async function renderPortfolio() {
  const { result } = renderHook(() => usePortfolio());
  // Wait for the default data to load.
  await waitFor(() => {
    expect(result.current.accounts.length).toBeGreaterThan(0);
  });
  return result;
}

describe("usePortfolioData", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves an account's holdings when it is renamed", async () => {
    const result = await renderPortfolio();

    const account = result.current.accounts[0];
    const holdingsBefore = result.current.analysis.accountTotals[account.key];
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
    expect(result.current.analysis.accountTotals[account.key]).toBe(
      holdingsBefore,
    );
  });

  it("updates only the targeted fund when asset classes share a name and ticker", async () => {
    const result = await renderPortfolio();

    // Give the second asset class the same name and ticker as the first.
    act(() => {
      result.current.portfolioList.setState(([first, second, ...rest]) => [
        first,
        {
          ...second,
          name: first.name,
          funds: [{ ...second.funds[0], ticker: first.funds[0].ticker }],
        },
        ...rest,
      ]);
    });
    const [first, second] = result.current.portfolio;
    const account = result.current.accounts[0].key;
    const secondBalanceBefore = second.funds[0].values[account];

    act(() => {
      result.current.updateFundBalance(first.funds[0].key, account, 999);
    });

    expect(result.current.portfolio[0].funds[0].values[account]).toBe(999);
    expect(result.current.portfolio[1].funds[0].values[account]).toBe(
      secondBalanceBefore,
    );
  });

  it("applies a planned change to an asset class whose name contains |", async () => {
    const result = await renderPortfolio();

    act(() => {
      result.current.portfolioList.setState(([first, ...rest]) => [
        { ...first, name: "US | Total" },
        ...rest,
      ]);
    });
    const fund = result.current.portfolio[0].funds[0];
    const account = result.current.accounts[0].key;
    const balanceBefore = fund.values[account];

    act(() => {
      result.current.enterPlanningMode();
    });
    act(() => {
      result.current.updatePendingChange(fund.key, account, 100);
    });
    act(() => {
      result.current.applyPendingChanges();
    });

    expect(result.current.portfolio[0].funds[0].values[account]).toBe(
      balanceBefore + 100,
    );
    expect(result.current.planningMode).toBe(false);
    expect(result.current.pendingChanges).toEqual({});
  });

  it("sums planned changes across funds and accounts", async () => {
    const result = await renderPortfolio();
    const [first, second] = result.current.portfolio;
    const [account1, account2] = result.current.accounts.map((a) => a.key);

    act(() => {
      result.current.enterPlanningMode();
    });
    act(() => {
      result.current.updatePendingChange(first.funds[0].key, account1, 100);
      result.current.updatePendingChange(first.funds[0].key, account2, 50);
      result.current.updatePendingChange(second.funds[0].key, account1, -40);
    });

    expect(result.current.pendingBalance).toBe(110);
  });
});
