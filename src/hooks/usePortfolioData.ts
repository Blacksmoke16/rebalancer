import { useListState } from "@mantine/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STORAGE } from "../constants";
import { withPendingChanges } from "../portfolio";
import { loadPortfolioData, savePortfolioData } from "../storage";
import { Account, AssetClass, PendingChanges } from "../types";
import { AccountId, createDollarAmount, DollarAmount } from "../types/branded";
import { defaultAccounts, defaultAssetClasses } from "../utils";

interface UsePortfolioDataReturn {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  planningMode: boolean;
  pendingChanges: PendingChanges;
  pendingBalance: number;
  updateFundBalance: (
    fundKey: string,
    accountId: AccountId,
    value: number,
  ) => void;
  updatePendingChange: (
    fundKey: string,
    accountId: AccountId,
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
    defaultAssetClasses(accounts),
  );
  const [toInvest, setToInvest] = useState(() => createDollarAmount(1500));
  const [isLoaded, setIsLoaded] = useState(false);

  // Planning mode state
  const [planningMode, setPlanningMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({});

  // Calculate the pending balance (sum of all pending changes)
  const pendingBalance = useMemo(() => {
    return Object.values(pendingChanges)
      .flatMap((changes) => Object.values(changes))
      .reduce((sum, amt) => sum + amt, 0);
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

  const updateFundBalance = useCallback(
    (fundKey: string, accountId: AccountId, value: number): void => {
      portfolioList.setState((prev) =>
        prev.map((assetClass) => ({
          ...assetClass,
          funds: assetClass.funds.map((fund) => {
            if (fund.key !== fundKey) return fund;

            return {
              ...fund,
              values: {
                ...fund.values,
                [accountId]: createDollarAmount(value),
              },
            };
          }),
        })),
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
    const defaultPortfolioList = defaultAssetClasses(defaultAccountsList);
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
    (fundKey: string, accountId: AccountId, changeAmount: number): void => {
      setPendingChanges((prev) => ({
        ...prev,
        [fundKey]: { ...prev[fundKey], [accountId]: changeAmount },
      }));
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
    portfolioList.setState((prev) => withPendingChanges(prev, pendingChanges));

    // Clear planning mode state
    setPlanningMode(false);
    setPendingChanges({});
  }, [pendingChanges, portfolioList]);

  return {
    // State
    accounts,
    portfolio,
    toInvest,
    planningMode,
    pendingChanges,
    pendingBalance,

    // Actions
    updateFundBalance,
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
