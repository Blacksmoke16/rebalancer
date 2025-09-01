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

export function defaultAssetClasses(): AssetClass[] {
  return [
    {
      name: "US Total Stock Market",
      allocation: createPercentage(60),
      funds: [
        {
          ticker: createFundTicker("VTI"),
          values: {
            "401k": createDollarAmount(3730),
            "Roth IRA": createDollarAmount(6927),
            "Taxable Brokerage": createDollarAmount(19714),
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
            "401k": createDollarAmount(17573),
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
            "401k": createDollarAmount(5090),
          },
          key: randomId(),
        },
      ],
      key: createAssetClassId(randomId()),
    },
  ];
}
