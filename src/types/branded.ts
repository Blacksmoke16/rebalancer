export type Brand<T, K> = T & { __brand: K };

export type DollarAmount = Brand<number, "dollar">;
export type ShareCount = Brand<number, "shares">;
export type AccountId = Brand<string, "accountId">;
export type AssetClassId = Brand<string, "assetClassId">;

export const createDollarAmount = (value: number): DollarAmount => {
  if (value < 0) {
    throw new Error(`Invalid dollar amount: ${value}. Must be non-negative.`);
  }
  return Math.round(value) as DollarAmount;
};

// Funds can hold fractional shares, so unlike dollar amounts, share counts keep
// up to 6 decimal places. Rounding there drops floating-point noise, such as
// the -0.0000000001 shares left after selling a holding's whole dollar value.
export const createShareCount = (value: number): ShareCount => {
  const rounded = Math.round(value * 1e6) / 1e6;
  if (rounded < 0) {
    throw new Error(`Invalid share count: ${value}. Must be non-negative.`);
  }
  // Rounding noise below zero gives -0, which formats as "-0".
  return (rounded === 0 ? 0 : rounded) as ShareCount;
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
