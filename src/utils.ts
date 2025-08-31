import { randomId } from "@mantine/hooks";
import { Account, AssetClass } from "./types";
import {
  createAccountId,
  createAssetClassId,
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

export function defaultAssetClasses(): AssetClass[] {
  return [
    {
      name: "US Total Stock Market",
      allocation: createPercentage(60),
      funds: [{ ticker: createFundTicker("VTI"), values: {}, key: randomId() }],
      key: createAssetClassId(randomId()),
    },
    {
      name: "International Total Stock Market",
      allocation: createPercentage(30),
      funds: [
        { ticker: createFundTicker("VXUS"), values: {}, key: randomId() },
      ],
      key: createAssetClassId(randomId()),
    },
    {
      name: "US Total Bond Market",
      allocation: createPercentage(10),
      funds: [{ ticker: createFundTicker("BND"), values: {}, key: randomId() }],
      key: createAssetClassId(randomId()),
    },
  ];
}
