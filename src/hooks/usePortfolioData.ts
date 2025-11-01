import { useListState } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { STORAGE } from "../constants";
import { loadPortfolioData, savePortfolioData } from "../storage";
import { Account, AssetClass } from "../types";
import { createDollarAmount, DollarAmount } from "../types/branded";
import { defaultAccounts, defaultAssetClasses } from "../utils";

interface UsePortfolioDataReturn {
  accounts: Account[];
  portfolio: AssetClass[];
  toInvest: DollarAmount;
  updateAssetAccountValue: (
    assetClassName: string,
    fundTicker: string,
    accountName: string,
    value: number,
  ) => void;
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

  return {
    // State
    accounts,
    portfolio,
    toInvest,

    // Actions
    updateAssetAccountValue,
    handleDataImport,
    resetToDefaults,
    setToInvest,

    // List state handlers
    accountList,
    portfolioList,
  };
}
