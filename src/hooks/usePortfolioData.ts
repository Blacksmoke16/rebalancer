import { useEffect, useState } from "react";
import { STORAGE } from "../constants";
import {
  analyzePortfolio,
  toDollarFund,
  toShareFund,
  withoutOrphanedBalances,
  withPendingChanges,
} from "../portfolio";
import { loadPortfolioData, savePortfolioData } from "../storage";
import {
  Account,
  AssetClass,
  Fund,
  PendingChanges,
  PortfolioData,
} from "../types";
import {
  AccountId,
  createDollarAmount,
  createShareCount,
  DollarAmount,
} from "../types/branded";
import { defaultAccounts, defaultAssetClasses } from "../utils";

type PortfolioState = Pick<
  PortfolioData,
  "accounts" | "portfolio" | "toInvest"
>;

function defaultPortfolioState(): PortfolioState {
  const accounts = defaultAccounts();
  return {
    accounts,
    portfolio: defaultAssetClasses(accounts),
    toInvest: createDollarAmount(1500),
  };
}

// Saved data if there is any, otherwise the defaults.
function initialPortfolioState(): PortfolioState {
  const saved = loadPortfolioData();
  if (!saved) return defaultPortfolioState();
  const { accounts, portfolio, toInvest } = saved;
  return { accounts, portfolio, toInvest };
}

export function usePortfolioData() {
  // Loaded during the first render so saved data shows without a flash of the
  // defaults.
  const [portfolioState, setPortfolioState] = useState(initialPortfolioState);
  const { accounts, portfolio, toInvest } = portfolioState;

  // Planning mode state
  const [planningMode, setPlanningMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Calculate the pending balance (sum of all pending changes)
  const pendingBalance = Object.values(pendingChanges)
    .flatMap((changes) => Object.values(changes))
    .reduce((sum, amt) => sum + amt, 0);

  // Analysis of the portfolio with any pending changes applied. Pending changes
  // only exist in planning mode; they're cleared whenever planning mode starts
  // or ends.
  const analysis = analyzePortfolio(
    withPendingChanges(portfolio, pendingChanges),
    toInvest,
  );

  // Save shortly after changes stop to avoid excessive localStorage writes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      savePortfolioData(accounts, portfolio, toInvest);
    }, STORAGE.AUTO_SAVE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [accounts, portfolio, toInvest]);

  // Pending changes are planned against the current accounts, funds, and
  // balances, so every action that replaces those also ends planning mode.
  function exitPlanningMode(): void {
    setPlanningMode(false);
    setPendingChanges({});
  }

  function setToInvest(value: DollarAmount): void {
    setPortfolioState((prev) => ({ ...prev, toInvest: value }));
  }

  // Replaces the fund with the given key with `update(fund)`.
  function updateFund(fundKey: string, update: (fund: Fund) => Fund): void {
    setPortfolioState((prev) => ({
      ...prev,
      portfolio: prev.portfolio.map((assetClass) => ({
        ...assetClass,
        funds: assetClass.funds.map((fund) =>
          fund.key === fundKey ? update(fund) : fund,
        ),
      })),
    }));
  }

  // `value` is in the fund's unit: dollars for a dollar fund, shares for a
  // share fund.
  function updateFundBalance(
    fundKey: string,
    accountId: AccountId,
    value: number,
  ): void {
    updateFund(fundKey, (fund) =>
      fund.unit === "shares"
        ? {
            ...fund,
            shares: { ...fund.shares, [accountId]: createShareCount(value) },
          }
        : {
            ...fund,
            values: { ...fund.values, [accountId]: createDollarAmount(value) },
          },
    );
  }

  // A price of 0, as from a cleared input, leaves the fund unpriced. Setting
  // the price the fund already has keeps its date: the price input reports its
  // value whenever that value changes, including after a conversion sets it.
  function updateFundPrice(fundKey: string, price: number): void {
    const newPrice = price > 0 ? price : null;
    const now = new Date().toISOString();
    updateFund(fundKey, (fund) => {
      if (fund.unit !== "shares" || fund.price === newPrice) return fund;
      return {
        ...fund,
        price: newPrice,
        priceAsOf: newPrice === null ? null : now,
      };
    });
  }

  function convertFundToShares(fundKey: string, price: number): void {
    const now = new Date().toISOString();
    updateFund(fundKey, (fund) =>
      fund.unit === "dollars" ? toShareFund(fund, price, now) : fund,
    );
  }

  function convertFundToDollars(fundKey: string): void {
    updateFund(fundKey, (fund) =>
      fund.unit === "shares" ? toDollarFund(fund) : fund,
    );
  }

  // Balances held in accounts that are no longer in the list are dropped.
  function updateAccounts(newAccounts: Account[]): void {
    setPortfolioState((prev) => ({
      ...prev,
      accounts: newAccounts,
      portfolio: withoutOrphanedBalances(prev.portfolio, newAccounts),
    }));
    exitPlanningMode();
  }

  function updatePortfolio(newPortfolio: AssetClass[]): void {
    setPortfolioState((prev) => ({ ...prev, portfolio: newPortfolio }));
    exitPlanningMode();
  }

  function handleDataImport(
    newAccounts: Account[],
    newPortfolio: AssetClass[],
    newToInvest: DollarAmount,
  ): void {
    setPortfolioState({
      accounts: newAccounts,
      portfolio: newPortfolio,
      toInvest: newToInvest,
    });
    exitPlanningMode();
    // Immediately save the imported data to localStorage
    savePortfolioData(newAccounts, newPortfolio, newToInvest);
  }

  function resetToDefaults(): void {
    const defaults = defaultPortfolioState();
    setPortfolioState(defaults);
    exitPlanningMode();

    // Save the reset state immediately
    savePortfolioData(defaults.accounts, defaults.portfolio, defaults.toInvest);
  }

  function updatePendingChange(
    fundKey: string,
    accountId: AccountId,
    changeAmount: number,
  ): void {
    setPendingChanges((prev) => ({
      ...prev,
      [fundKey]: { ...prev[fundKey], [accountId]: changeAmount },
    }));
  }

  function enterPlanningMode(): void {
    setPlanningMode(true);
    setPendingChanges({});
  }

  function applyPendingChanges(): void {
    setPortfolioState((prev) => ({
      ...prev,
      portfolio: withPendingChanges(prev.portfolio, pendingChanges),
    }));

    // Clear planning mode state
    exitPlanningMode();
  }

  return {
    // State
    accounts,
    portfolio,
    toInvest,
    planningMode,
    pendingChanges,
    pendingBalance,
    analysis,

    // Actions
    updateFundBalance,
    updateFundPrice,
    convertFundToShares,
    convertFundToDollars,
    updatePendingChange,
    updateAccounts,
    updatePortfolio,
    enterPlanningMode,
    exitPlanningMode,
    applyPendingChanges,
    handleDataImport,
    resetToDefaults,
    setToInvest,
  };
}
