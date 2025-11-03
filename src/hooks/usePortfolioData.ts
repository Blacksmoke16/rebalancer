import { useListState } from "@mantine/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE } from "../constants";
import { loadPortfolioData, savePortfolioData } from "../storage";
import { Account, AssetClass } from "../types";
import { createDollarAmount, DollarAmount } from "../types/branded";
import { defaultAccounts, defaultAssetClasses } from "../utils";

export type PendingChanges = Record<string, number>;

function getPendingChangeKey(
  assetClassName: string,
  fundTicker: string,
  accountName: string,
): string {
  return `${assetClassName}|${fundTicker}|${accountName}`;
}

interface UsePortfolioDataReturn {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  planningMode: boolean;
  pendingChanges: PendingChanges;
  pendingBalance: number;
  updateAssetAccountValue: (
    assetClassName: string,
    fundTicker: string,
    accountName: string,
    value: number,
  ) => void;
  updatePendingChange: (
    assetClassName: string,
    fundTicker: string,
    accountName: string,
    changeAmount: number,
  ) => void;
  enterPlanningMode: () => void;
  exitPlanningMode: () => void;
  applyPendingChanges: () => void;
  handleDataImport: (
    newAccounts: Account[],
    newPortfolio: AssetClass[],
    newToInvest: DollarAmount,
  ) => void;
  resetToDefaults: () => void;
  setToInvest: (value: DollarAmount) => void;
  accountList: ReturnType<typeof useListState<Account>>[1];
  portfolioList: ReturnType<typeof useListState<AssetClass>>[1];
}

export function usePortfolioData(): UsePortfolioDataReturn {
  // Initialize state with defaults, will be overridden by useEffect if data exists
  const [accounts, accountList] = useListState<Account>(() =>
    defaultAccounts(),
  );
  const [portfolio, portfolioList] = useListState<AssetClass>(() =>
    defaultAssetClasses(),
  );
  const [toInvest, setToInvest] = useState(() => createDollarAmount(1500));
  const [isLoaded, setIsLoaded] = useState(false);

  // Planning mode state
  const [planningMode, setPlanningMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Calculate the pending balance (sum of all pending changes)
  const pendingBalance = useMemo(() => {
    return Object.values(pendingChanges).reduce((sum, amt) => sum + amt, 0);
  }, [pendingChanges]);

  // Debounced save function to avoid excessive localStorage writes
  const debouncedSave = useCallback(() => {
    const timeoutId = setTimeout(() => {
      savePortfolioData(accounts, portfolio, toInvest);
    }, STORAGE.AUTO_SAVE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [accounts, portfolio, toInvest]);

  // Load data from localStorage on component mount
  useEffect(() => {
    // Use queueMicrotask to avoid synchronous setState warning
    queueMicrotask(() => {
      const savedData = loadPortfolioData();
      if (savedData) {
        accountList.setState(savedData.accounts);
        portfolioList.setState(savedData.portfolio);
        setToInvest(savedData.toInvest);
      }
      setIsLoaded(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save when data changes
  useEffect(() => {
    if (isLoaded) {
      const cleanup = debouncedSave();
      return cleanup;
    }
  }, [accounts, portfolio, toInvest, isLoaded, debouncedSave]);

  const updateAssetAccountValue = useCallback(
    (
      assetClassName: string,
      fundTicker: string,
      accountName: string,
      value: number,
    ): void => {
      portfolioList.setState((prev) =>
        prev.map((assetClass) => {
          if (assetClass.name !== assetClassName) return assetClass;

          return {
            ...assetClass,
            funds: assetClass.funds.map((fund) => {
              if (fund.ticker !== fundTicker) return fund;

              return {
                ...fund,
                values: {
                  ...fund.values,
                  [accountName]: createDollarAmount(value),
                },
              };
            }),
          };
        }),
      );
    },
    [portfolioList],
  );

  const handleDataImport = useCallback(
    (
      newAccounts: Account[],
      newPortfolio: AssetClass[],
      newToInvest: DollarAmount,
    ): void => {
      accountList.setState(newAccounts);
      portfolioList.setState(newPortfolio);
      setToInvest(newToInvest);
      // Immediately save the imported data to localStorage
      savePortfolioData(newAccounts, newPortfolio, newToInvest);
    },
    [accountList, portfolioList],
  );

  const resetToDefaults = useCallback((): void => {
    const defaultAccountsList = defaultAccounts();
    const defaultPortfolioList = defaultAssetClasses();
    const defaultToInvestValue = createDollarAmount(1500);

    accountList.setState(defaultAccountsList);
    portfolioList.setState(defaultPortfolioList);
    setToInvest(defaultToInvestValue);

    // Save the reset state immediately
    savePortfolioData(
      defaultAccountsList,
      defaultPortfolioList,
      defaultToInvestValue,
    );
  }, [accountList, portfolioList]);

  const updatePendingChange = useCallback(
    (
      assetClassName: string,
      fundTicker: string,
      accountName: string,
      changeAmount: number,
    ): void => {
      const key = getPendingChangeKey(assetClassName, fundTicker, accountName);
      setPendingChanges((prev) => {
        // Remove the entry if the change is zero
        if (changeAmount === 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _, ...rest } = prev;
          return rest;
        }
        return {
          ...prev,
          [key]: changeAmount,
        };
      });
    },
    [],
  );

  const enterPlanningMode = useCallback((): void => {
    setPlanningMode(true);
    setPendingChanges({});
  }, []);

  const exitPlanningMode = useCallback((): void => {
    setPlanningMode(false);
    setPendingChanges({});
  }, []);

  const applyPendingChanges = useCallback((): void => {
    // Apply each pending change to the actual holdings
    Object.entries(pendingChanges).forEach(([key, changeAmount]) => {
      const [assetClassName, fundTicker, accountName] = key.split("|");

      // Find current value
      const assetClass = portfolio.find((ac) => ac.name === assetClassName);
      if (!assetClass) return;

      const fund = assetClass.funds.find((f) => f.ticker === fundTicker);
      if (!fund) return;

      const currentValue = fund.values[accountName] ?? 0;
      const newValue = currentValue + changeAmount;

      // Update the value
      updateAssetAccountValue(
        assetClassName,
        fundTicker,
        accountName,
        newValue,
      );
    });

    // Clear planning mode state
    setPlanningMode(false);
    setPendingChanges({});
  }, [pendingChanges, portfolio, updateAssetAccountValue]);

  return {
    // State
    accounts,
    portfolio,
    toInvest,
    planningMode,
    pendingChanges,
    pendingBalance,

    // Actions
    updateAssetAccountValue,
    updatePendingChange,
    enterPlanningMode,
    exitPlanningMode,
    applyPendingChanges,
    handleDataImport,
    resetToDefaults,
    setToInvest,

    // List state handlers
    accountList,
    portfolioList,
  };
}
