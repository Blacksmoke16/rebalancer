import { formRootRule, isInRange, isNotEmpty, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { useEffect } from "react";
import { AssetClass, Fund } from "../types";
import { AssetClassId } from "../types/branded";
import {
  sanitizeName,
  validateAllocationSum,
  validateTicker,
} from "../utils/validation";

// The fund whose field is at `path`, e.g. "portfolio.1.funds.0.ticker".
function fundAtPath(values: { portfolio: AssetClass[] }, path: string): Fund {
  const [, assetClassIndex, , fundIndex] = path.split(".");
  return values.portfolio[Number(assetClassIndex)].funds[Number(fundIndex)];
}

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
          ticker: (value: string, values, path) =>
            validateTicker(value, fundAtPath(values, path).unit),
        },
      },
    },
    transformValues: (values) => ({
      portfolio: values.portfolio.map((assetClass) => ({
        ...assetClass,
        name: sanitizeName(assetClass.name),
        funds: assetClass.funds.map((fund) => ({
          ...fund,
          ticker: fund.ticker.trim(),
        })),
      })),
    }),
  });

  // Update form when portfolio prop changes (e.g., after import)
  useEffect(() => {
    form.setInitialValues({ portfolio });
    form.setValues({ portfolio });
  }, [portfolio]); // eslint-disable-line react-hooks/exhaustive-deps

  // The form only edits tickers, so each existing fund keeps its current unit,
  // holdings, and price rather than the form's copy; funds added in the form
  // keep theirs.
  function preserveFundHoldings(newPortfolio: AssetClass[]): AssetClass[] {
    const fundsByKey = new Map(
      portfolio
        .flatMap((assetClass) => assetClass.funds)
        .map((fund) => [fund.key, fund]),
    );

    return newPortfolio.map((assetClass) => ({
      ...assetClass,
      funds: assetClass.funds.map((fund) => {
        const current = fundsByKey.get(fund.key);
        return current ? { ...current, ticker: fund.ticker } : fund;
      }),
    }));
  }

  function handleSubmit(values: { portfolio: AssetClass[] }) {
    const portfolioWithPreservedHoldings = preserveFundHoldings(
      values.portfolio,
    );
    onPortfolioChange(portfolioWithPreservedHoldings);
    form.setInitialValues({ portfolio: portfolioWithPreservedHoldings });
    form.reset();
  }

  function addAssetClass() {
    form.insertListItem("portfolio", {
      name: "",
      allocation: 0,
      funds: [{ ticker: "", unit: "dollars", values: {}, key: randomId() }],
      key: randomId() as AssetClassId,
    });
    form.clearFieldError("portfolio");
  }

  function removeAssetClass(index: number) {
    form.removeListItem("portfolio", index);
  }

  function addFund(assetClassIndex: number) {
    form.insertListItem(`portfolio.${assetClassIndex}.funds`, {
      ticker: "",
      unit: "dollars",
      values: {},
      key: randomId(),
    });
  }

  function removeFund(assetClassIndex: number, fundIndex: number) {
    form.removeListItem(`portfolio.${assetClassIndex}.funds`, fundIndex);
  }

  function getTotalAllocation() {
    return form.values.portfolio.reduce(
      (sum, ac) => sum + (ac.allocation || 0),
      0,
    );
  }

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
