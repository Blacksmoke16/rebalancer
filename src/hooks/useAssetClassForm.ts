import { formRootRule, isNotEmpty, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { useCallback, useEffect } from "react";
import { AssetClass } from "../types";
import { validation, validateAndTransform } from "../utils/validation";

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
          return validation.validateAllocationSum(value);
        },
        name: (value: string) => {
          const result = validateAndTransform.name(value);
          return result.isValid ? null : result.error;
        },
        allocation: (value: number) => {
          const result = validateAndTransform.percentage(value);
          return result.isValid ? null : result.error;
        },
        funds: {
          [formRootRule]: isNotEmpty("Must have at least one fund"),
          ticker: (value: string) => {
            const result = validateAndTransform.ticker(value);
            return result.isValid ? null : result.error;
          },
        },
      },
    },
  });

  // Update form when portfolio prop changes (e.g., after import)
  useEffect(() => {
    form.setInitialValues({ portfolio });
    form.setValues({ portfolio });
  }, [portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  const preserveFundValues = useCallback(
    (newPortfolio: AssetClass[]): AssetClass[] => {
      return newPortfolio.map((newAssetClass) => {
        const existingAssetClass = portfolio.find(
          (existing) => existing.name === newAssetClass.name,
        );

        if (!existingAssetClass) {
          return newAssetClass;
        }

        const updatedFunds = newAssetClass.funds.map((newFund) => {
          const existingFund = existingAssetClass.funds.find(
            (existing) => existing.ticker === newFund.ticker,
          );

          if (existingFund) {
            return {
              ...newFund,
              values: existingFund.values,
            };
          }

          return newFund;
        });

        return {
          ...newAssetClass,
          funds: updatedFunds,
        };
      });
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
      allocation: 0,
      funds: [{ ticker: "", values: {}, key: randomId() }],
      key: randomId(),
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
        ticker: "",
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
