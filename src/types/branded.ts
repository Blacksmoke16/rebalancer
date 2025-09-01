export type Brand<T, K> = T & { __brand: K };

export type Percentage = Brand<number, "percentage">;
export type DollarAmount = Brand<number, "dollar">;
export type AccountId = Brand<string, "accountId">;
export type AssetClassId = Brand<string, "assetClassId">;
export type FundTicker = Brand<string, "fundTicker">;

export const createPercentage = (value: number): Percentage => {
  if (value < 0 || value > 100) {
    throw new Error(`Invalid percentage: ${value}. Must be between 0 and 100.`);
  }
  return value as Percentage;
};

export const createDollarAmount = (value: number): DollarAmount => {
  if (value < 0) {
    throw new Error(`Invalid dollar amount: ${value}. Must be non-negative.`);
  }
  return Math.round(value) as DollarAmount;
};

export const createAccountId = (value: string): AccountId => {
  if (!value.trim()) {
    throw new Error("Account ID cannot be empty");
  }
  return value.trim() as AccountId;
};

export const createAssetClassId = (value: string): AssetClassId => {
  if (!value.trim()) {
    throw new Error("Asset class ID cannot be empty");
  }
  return value.trim() as AssetClassId;
};

export const createFundTicker = (value: string): FundTicker => {
  if (!value.trim()) {
    throw new Error("Fund ticker cannot be empty");
  }
  return value.trim().toUpperCase() as FundTicker;
};
