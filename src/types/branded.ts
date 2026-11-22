export type Brand<T, K> = T & { __brand: K };

export type DollarAmount = Brand<number, "dollar">;
export type AccountId = Brand<string, "accountId">;
export type AssetClassId = Brand<string, "assetClassId">;

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
