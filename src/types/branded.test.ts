import { describe, it, expect } from "vitest";
import {
  createDollarAmount,
  createAccountId,
  createAssetClassId,
  createShareCount,
  type DollarAmount,
  type AccountId,
  type AssetClassId,
} from "./branded";

describe("Branded Types", () => {
  describe("createDollarAmount", () => {
    it("should create valid dollar amounts for non-negative values", () => {
      expect(createDollarAmount(0)).toBe(0);
      expect(createDollarAmount(100)).toBe(100);
      expect(createDollarAmount(1000.5)).toBe(1001); // Rounds to nearest dollar
      expect(createDollarAmount(999.49)).toBe(999);
    });

    it("should round to nearest dollar", () => {
      expect(createDollarAmount(10.4)).toBe(10);
      expect(createDollarAmount(10.5)).toBe(11);
      expect(createDollarAmount(10.6)).toBe(11);
      expect(createDollarAmount(999.99)).toBe(1000);
    });

    it("should throw error for negative values", () => {
      expect(() => createDollarAmount(-1)).toThrow(
        "Invalid dollar amount: -1. Must be non-negative.",
      );
      expect(() => createDollarAmount(-0.01)).toThrow(
        "Invalid dollar amount: -0.01. Must be non-negative.",
      );
    });

    it("should create branded type that is distinct from number", () => {
      const dollarAmount: DollarAmount = createDollarAmount(100);
      const number = 100;

      expect(dollarAmount).toBe(number);
      expect(typeof dollarAmount).toBe("number");
    });
  });

  describe("createShareCount", () => {
    it("should keep fractional shares", () => {
      expect(createShareCount(0)).toBe(0);
      expect(createShareCount(12)).toBe(12);
      expect(createShareCount(10.123456)).toBe(10.123456);
    });

    it("should round to 6 decimal places to drop floating-point noise", () => {
      expect(createShareCount(0.1 + 0.2)).toBe(0.3);
      expect(createShareCount(1.0000004)).toBe(1);
      expect(createShareCount(1.0000006)).toBe(1.000001);
    });

    it("should treat noise just below zero as zero", () => {
      expect(createShareCount(-1e-12)).toBe(0);
    });

    it("should throw error for negative values", () => {
      expect(() => createShareCount(-1)).toThrow(
        "Invalid share count: -1. Must be non-negative.",
      );
      expect(() => createShareCount(-0.001)).toThrow(
        "Invalid share count: -0.001. Must be non-negative.",
      );
    });
  });

  describe("createAccountId", () => {
    it("should create valid account IDs for non-empty strings", () => {
      expect(createAccountId("test")).toBe("test");
      expect(createAccountId("401k")).toBe("401k");
      expect(createAccountId("roth-ira-2024")).toBe("roth-ira-2024");
    });

    it("should trim whitespace", () => {
      expect(createAccountId("  test  ")).toBe("test");
      expect(createAccountId("\t401k\n")).toBe("401k");
    });

    it("should throw error for empty strings", () => {
      expect(() => createAccountId("")).toThrow("Account ID cannot be empty");
      expect(() => createAccountId("   ")).toThrow(
        "Account ID cannot be empty",
      );
      expect(() => createAccountId("\t\n")).toThrow(
        "Account ID cannot be empty",
      );
    });

    it("should create branded type that is distinct from string", () => {
      const accountId: AccountId = createAccountId("test");
      const string = "test";

      expect(accountId).toBe(string);
      expect(typeof accountId).toBe("string");
    });
  });

  describe("createAssetClassId", () => {
    it("should create valid asset class IDs for non-empty strings", () => {
      expect(createAssetClassId("stocks")).toBe("stocks");
      expect(createAssetClassId("bonds-international")).toBe(
        "bonds-international",
      );
    });

    it("should trim whitespace", () => {
      expect(createAssetClassId("  stocks  ")).toBe("stocks");
      expect(createAssetClassId("\tbonds\n")).toBe("bonds");
    });

    it("should throw error for empty strings", () => {
      expect(() => createAssetClassId("")).toThrow(
        "Asset class ID cannot be empty",
      );
      expect(() => createAssetClassId("   ")).toThrow(
        "Asset class ID cannot be empty",
      );
    });

    it("should create branded type that is distinct from string", () => {
      const assetClassId: AssetClassId = createAssetClassId("stocks");
      const string = "stocks";

      expect(assetClassId).toBe(string);
      expect(typeof assetClassId).toBe("string");
    });
  });
});
