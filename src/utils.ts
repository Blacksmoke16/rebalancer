import { randomId } from "@mantine/hooks";
import { Account, AssetClass } from "./types";
import {
  createAccountId,
  createAssetClassId,
  createDollarAmount,
  createFundTicker,
  createPercentage,
} from "./types/branded";

export function defaultAccounts(): Account[] {
  return [
    { name: "401k", key: createAccountId(randomId()) },
    { name: "Roth IRA", key: createAccountId(randomId()) },
    { name: "Taxable Brokerage", key: createAccountId(randomId()) },
  ];
}

// Builds the default holdings keyed by the given accounts' ids, so the seeded
// balances stay attached to those accounts regardless of how they're renamed.
export function defaultAssetClasses(accounts: Account[]): AssetClass[] {
  const [taxDeferred, roth, taxable] = accounts;
  return [
    {
      name: "US Total Stock Market",
      allocation: createPercentage(60),
      funds: [
        {
          ticker: createFundTicker("VTI"),
          values: {
            [taxDeferred.key]: createDollarAmount(3730),
            [roth.key]: createDollarAmount(6927),
            [taxable.key]: createDollarAmount(19714),
          },
          key: randomId(),
        },
      ],
      key: createAssetClassId(randomId()),
    },
    {
      name: "International Total Stock Market",
      allocation: createPercentage(30),
      funds: [
        {
          ticker: createFundTicker("VXUS"),
          values: {
            [taxDeferred.key]: createDollarAmount(17573),
          },
          key: randomId(),
        },
      ],
      key: createAssetClassId(randomId()),
    },
    {
      name: "US Total Bond Market",
      allocation: createPercentage(10),
      funds: [
        {
          ticker: createFundTicker("BND"),
          values: {
            [taxDeferred.key]: createDollarAmount(5090),
          },
          key: randomId(),
        },
      ],
      key: createAssetClassId(randomId()),
    },
  ];
}
