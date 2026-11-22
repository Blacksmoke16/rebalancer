import { formRootRule, isInRange, isNotEmpty, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { useCallback, useEffect } from "react";
import { AssetClass } from "../types";
import { AssetClassId, FundTicker, Percentage } from "../types/branded";
import {
  sanitizeName,
  validateAllocationSum,
  validateTicker,
} from "../utils/validation";

interface UseAssetClassFormProps {
  portfolio: AssetClass[];
  onPortfolioChange: (portfolio: AssetClass[]) => void;
}

export function useAssetClassForm({
  portfolio,
  onPortfolioChange,
}: UseAssetClassFormProps) {
  const form = useForm({
    mode: "controlled",
    initialValues: { portfolio },
    validateInputOnChange: true,
    validate: {
      portfolio: {
        [formRootRule]: (value: AssetClass[]) => {
          if (value.length === 0) return "Must have at least one asset class";
          return validateAllocationSum(value);
        },
        name: isNotEmpty("Name is required"),
        allocation: isInRange(
          { min: 0, max: 100 },
          "Must be a number between 0 and 100",
        ),
        funds: {
          [formRootRule]: isNotEmpty("Must have at least one fund"),
          ticker: validateTicker,
        },
      },
    },
    transformValues: (values) => ({
      portfolio: values.portfolio.map((assetClass) => ({
        ...assetClass,
        name: sanitizeName(assetClass.name),
        funds: assetClass.funds.map((fund) => ({
          ...fund,
          ticker: fund.ticker.trim() as FundTicker,
        })),
      })),
    }),
  });

  // Update form when portfolio prop changes (e.g., after import)
  useEffect(() => {
    form.setInitialValues({ portfolio });
    form.setValues({ portfolio });
  }, [portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  // The form doesn't edit balances, so each existing fund keeps its current
  // balances rather than the form's copy; funds added in the form keep theirs.
  const preserveFundValues = useCallback(
    (newPortfolio: AssetClass[]): AssetClass[] => {
      const valuesByFundKey = new Map(
        portfolio
          .flatMap((assetClass) => assetClass.funds)
          .map((fund) => [fund.key, fund.values]),
      );

      return newPortfolio.map((assetClass) => ({
        ...assetClass,
        funds: assetClass.funds.map((fund) => ({
          ...fund,
          values: valuesByFundKey.get(fund.key) ?? fund.values,
        })),
      }));
    },
    [portfolio],
  );

  const handleSubmit = useCallback(
    (values: { portfolio: AssetClass[] }) => {
      const portfolioWithPreservedValues = preserveFundValues(values.portfolio);
      onPortfolioChange(portfolioWithPreservedValues);
      form.setInitialValues({ portfolio: portfolioWithPreservedValues });
      form.reset();
    },
    [onPortfolioChange, preserveFundValues, form],
  );

  const addAssetClass = useCallback(() => {
    form.insertListItem("portfolio", {
      name: "",
      allocation: 0 as Percentage,
      funds: [{ ticker: "" as FundTicker, values: {}, key: randomId() }],
      key: randomId() as AssetClassId,
    });
    form.clearFieldError("portfolio");
  }, [form]);

  const removeAssetClass = useCallback(
    (index: number) => {
      form.removeListItem("portfolio", index);
    },
    [form],
  );

  const addFund = useCallback(
    (assetClassIndex: number) => {
      form.insertListItem(`portfolio.${assetClassIndex}.funds`, {
        ticker: "" as FundTicker,
        values: {},
        key: randomId(),
      });
    },
    [form],
  );

  const removeFund = useCallback(
    (assetClassIndex: number, fundIndex: number) => {
      form.removeListItem(`portfolio.${assetClassIndex}.funds`, fundIndex);
    },
    [form],
  );

  const getTotalAllocation = useCallback(() => {
    return form.values.portfolio.reduce(
      (sum, ac) => sum + (ac.allocation || 0),
      0,
    );
  }, [form.values.portfolio]);

  return {
    form,
    handleSubmit,
    addAssetClass,
    removeAssetClass,
    addFund,
    removeFund,
    getTotalAllocation,
  };
}
