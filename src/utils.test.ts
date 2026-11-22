import { describe, expect, it } from "vitest";
import { fundDollarValues } from "./portfolio";
import { defaultAccounts, defaultAssetClasses } from "./utils";

describe("defaultAccounts", () => {
  it("should include default accounts", () => {
    const accounts = defaultAccounts();

    expect(accounts).toHaveLength(3);
    expect(accounts.map((a) => a.name)).toEqual([
      "401k",
      "Roth IRA",
      "Taxable Brokerage",
    ]);
  });
});

describe("defaultAssetClasses", () => {
  it("should include default asset classes", () => {
    const portfolio = defaultAssetClasses(defaultAccounts());

    expect(portfolio).toHaveLength(3);
    const assetClassNames = portfolio.map((p) => p.name);
    expect(assetClassNames).toContain("US Total Stock Market");
    expect(assetClassNames).toContain("International Total Stock Market");
    expect(assetClassNames).toContain("US Total Bond Market");
  });

  it("should have allocations that sum to 100%", () => {
    const portfolio = defaultAssetClasses(defaultAccounts());

    const totalAllocation = portfolio.reduce((sum, p) => sum + p.allocation, 0);
    expect(totalAllocation).toBe(100);
  });

  it("should key every balance by one of the given accounts' ids", () => {
    const accounts = defaultAccounts();
    const accountIds = accounts.map((a) => a.key);

    const balanceKeys = defaultAssetClasses(accounts).flatMap((assetClass) =>
      assetClass.funds.flatMap((fund) => Object.keys(fundDollarValues(fund))),
    );

    expect(balanceKeys.length).toBeGreaterThan(0);
    for (const key of balanceKeys) {
      expect(accountIds).toContain(key);
    }
  });
});
