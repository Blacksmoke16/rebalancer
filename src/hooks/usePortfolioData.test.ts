import { describe, it, expect, beforeEach, vi } from "vitest";
import { STORAGE } from "../constants";
import { act, createMockPortfolioData, renderHook } from "../test/utils";
import { usePortfolioData } from "./usePortfolioData";

function renderPortfolio() {
  return renderHook(() => usePortfolioData()).result;
}

type Portfolio = ReturnType<typeof renderPortfolio>;

// Enters planning mode with a planned sale of the first fund's whole balance in
// the first account.
function planSaleInFirstAccount(result: Portfolio) {
  const fund = result.current.portfolio[0].funds[0];
  const account = result.current.accounts[0].key;
  const balance: number = fund.values[account] ?? 0;
  act(() => {
    result.current.enterPlanningMode();
  });
  act(() => {
    result.current.updatePendingChange(fund.key, account, -balance);
  });
  expect(result.current.pendingBalance).toBeLessThan(0);
}

function expectPlanningEnded(result: Portfolio) {
  expect(result.current.planningMode).toBe(false);
  expect(result.current.pendingChanges).toEqual({});
}

describe("usePortfolioData", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves an account's holdings when it is renamed", () => {
    const result = renderPortfolio();

    const account = result.current.accounts[0];
    const holdingsBefore = result.current.analysis.accountTotals[account.key];
    expect(holdingsBefore).toBeGreaterThan(0);

    // Rename the account, keeping its stable key (what the settings form does).
    act(() => {
      result.current.updateAccounts(
        result.current.accounts.map((a) =>
          a.key === account.key ? { ...a, name: `${a.name} (renamed)` } : a,
        ),
      );
    });

    // The renamed account still owns the same holdings.
    expect(result.current.analysis.accountTotals[account.key]).toBe(
      holdingsBefore,
    );
  });

  it("drops a deleted account's balances so totals match the remaining accounts", () => {
    const result = renderPortfolio();
    const [deleted, ...remaining] = result.current.accounts;

    act(() => {
      result.current.updateAccounts(remaining);
    });

    const { total, accountTotals } = result.current.analysis;
    expect(accountTotals[deleted.key]).toBeUndefined();
    expect(total).toBe(
      remaining.reduce((sum, a) => sum + (accountTotals[a.key] ?? 0), 0),
    );
  });

  it("ends planning mode when accounts are saved", () => {
    const result = renderPortfolio();
    planSaleInFirstAccount(result);

    // Deleting the account the planned sale was in.
    act(() => {
      result.current.updateAccounts(result.current.accounts.slice(1));
    });

    expectPlanningEnded(result);
  });

  it("ends planning mode when the portfolio is saved", () => {
    const result = renderPortfolio();
    planSaleInFirstAccount(result);

    act(() => {
      result.current.updatePortfolio(result.current.portfolio);
    });

    expectPlanningEnded(result);
  });

  it("ends planning mode when data is imported", () => {
    const result = renderPortfolio();
    planSaleInFirstAccount(result);

    // Importing the same accounts and funds with smaller balances.
    act(() => {
      result.current.handleDataImport(
        result.current.accounts,
        result.current.portfolio.map((assetClass) => ({
          ...assetClass,
          funds: assetClass.funds.map((fund) => ({ ...fund, values: {} })),
        })),
        result.current.toInvest,
      );
    });

    expectPlanningEnded(result);
  });

  it("ends planning mode when reset to defaults", () => {
    const result = renderPortfolio();
    planSaleInFirstAccount(result);

    act(() => {
      result.current.resetToDefaults();
    });

    expectPlanningEnded(result);
  });

  it("updates only the targeted fund when asset classes share a name and ticker", () => {
    const result = renderPortfolio();

    // Give the second asset class the same name and ticker as the first.
    const [first, second, ...rest] = result.current.portfolio;
    act(() => {
      result.current.updatePortfolio([
        first,
        {
          ...second,
          name: first.name,
          funds: [{ ...second.funds[0], ticker: first.funds[0].ticker }],
        },
        ...rest,
      ]);
    });
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

  it("applies a planned change to an asset class whose name contains |", () => {
    const result = renderPortfolio();

    const [first, ...rest] = result.current.portfolio;
    act(() => {
      result.current.updatePortfolio([
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
    expectPlanningEnded(result);
  });

  it("sums planned changes across funds and accounts", () => {
    const result = renderPortfolio();
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

  it("uses saved data from the first render", () => {
    const saved = createMockPortfolioData();
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(saved));
    const accountNamesPerRender: string[][] = [];

    renderHook(() => {
      const data = usePortfolioData();
      accountNamesPerRender.push(data.accounts.map((a) => a.name));
      return data;
    });

    expect(accountNamesPerRender[0]).toEqual(saved.accounts.map((a) => a.name));
  });

  it("saves changes once they stop for the auto-save delay", () => {
    vi.useFakeTimers();
    try {
      const result = renderPortfolio();
      const fund = result.current.portfolio[0].funds[0];
      const account = result.current.accounts[0].key;

      act(() => {
        result.current.updateFundBalance(fund.key, account, 4321);
      });
      act(() => {
        vi.advanceTimersByTime(STORAGE.AUTO_SAVE_DELAY_MS - 1);
      });
      expect(localStorage.setItem).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      const [key, json] = vi.mocked(localStorage.setItem).mock.calls[0];
      expect(key).toBe(STORAGE.KEY);
      expect(JSON.parse(json).portfolio[0].funds[0].values[account]).toBe(4321);
    } finally {
      vi.useRealTimers();
    }
  });
});
