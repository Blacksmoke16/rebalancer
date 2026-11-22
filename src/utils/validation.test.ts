import { describe, it, expect } from "vitest";
import {
  sanitizeName,
  validateAllocationSum,
  validateTicker,
} from "./validation";

describe("validateTicker", () => {
  describe("for dollar funds", () => {
    it("should accept valid ticker strings", () => {
      expect(validateTicker("VTI", "dollars")).toBe(null);
      expect(validateTicker("VXUS", "dollars")).toBe(null);
      expect(validateTicker("BND", "dollars")).toBe(null);
      expect(validateTicker("A", "dollars")).toBe(null);
    });

    it("should accept lowercase tickers", () => {
      expect(validateTicker("vti", "dollars")).toBe(null);
      expect(validateTicker("vxus", "dollars")).toBe(null);
    });

    it("should accept multiple tickers with slash", () => {
      expect(validateTicker("VTSAX / VTI", "dollars")).toBe(null);
      expect(validateTicker("VTI/VTSAX", "dollars")).toBe(null);
    });

    it("should accept tickers with numbers", () => {
      expect(validateTicker("VTI123", "dollars")).toBe(null);
      expect(validateTicker("FUND1", "dollars")).toBe(null);
    });

    it("should accept tickers with surrounding whitespace", () => {
      expect(validateTicker("  vti  ", "dollars")).toBe(null);
    });

    it("should reject empty or invalid tickers", () => {
      expect(validateTicker("", "dollars")).toBe("Ticker is required");
      expect(validateTicker("   ", "dollars")).toBe("Ticker is required");
      expect(validateTicker("VTI-A", "dollars")).toBe("Ticker is required");
      expect(validateTicker("VTI.A", "dollars")).toBe("Ticker is required");
      expect(validateTicker("VTI@", "dollars")).toBe("Ticker is required");
    });
  });

  describe("for share funds", () => {
    const SINGLE_SYMBOL = "Use a single ticker symbol, like VTI or BRK-B";

    it("should accept a single symbol, including Yahoo's punctuation", () => {
      expect(validateTicker("VTI", "shares")).toBe(null);
      expect(validateTicker("vtsax", "shares")).toBe(null);
      expect(validateTicker("BRK-B", "shares")).toBe(null);
      expect(validateTicker("BRK.B", "shares")).toBe(null);
      expect(validateTicker("BTC-USD", "shares")).toBe(null);
      expect(validateTicker("EURUSD=X", "shares")).toBe(null);
      expect(validateTicker("  VTI  ", "shares")).toBe(null);
    });

    it("should reject several tickers in one row", () => {
      expect(validateTicker("VTSAX / VTI", "shares")).toBe(SINGLE_SYMBOL);
      expect(validateTicker("VTSAX VTI", "shares")).toBe(SINGLE_SYMBOL);
    });

    it("should reject empty or invalid symbols", () => {
      expect(validateTicker("", "shares")).toBe(SINGLE_SYMBOL);
      expect(validateTicker("VTI@", "shares")).toBe(SINGLE_SYMBOL);
    });
  });
});

describe("validateAllocationSum", () => {
  it("should return null for allocations that sum to 100", () => {
    const portfolio = [
      { allocation: 50 },
      { allocation: 30 },
      { allocation: 20 },
    ];
    expect(validateAllocationSum(portfolio)).toBe(null);
  });

  it("should return error for allocations that do not sum to 100", () => {
    const portfolio = [
      { allocation: 50 },
      { allocation: 30 },
      { allocation: 30 }, // Total: 110
    ];
    const result = validateAllocationSum(portfolio);
    expect(result).toBe("Total allocation is 110.0%. Must equal 100%.");
  });

  it("should handle floating point differences", () => {
    const portfolio = [
      { allocation: 33.33 },
      { allocation: 33.33 },
      { allocation: 33.34 },
    ];
    expect(validateAllocationSum(portfolio)).toBe(null);
  });

  it("should handle missing allocation values", () => {
    const portfolio = [
      { allocation: 50 },
      {}, // No allocation property
      { allocation: 30 },
    ] as any;
    const result = validateAllocationSum(portfolio);
    expect(result).toBe("Total allocation is 80.0%. Must equal 100%.");
  });
});

describe("sanitizeName", () => {
  it("should trim and normalize whitespace", () => {
    expect(sanitizeName("Test Name")).toBe("Test Name");
    expect(sanitizeName("  Test   Name  ")).toBe("Test Name");
    expect(sanitizeName("Test\t\nName")).toBe("Test Name");
  });

  it("should handle empty strings", () => {
    expect(sanitizeName("")).toBe("");
    expect(sanitizeName("   ")).toBe("");
  });

  it("should collapse multiple spaces", () => {
    expect(sanitizeName("Test     Name")).toBe("Test Name");
    expect(sanitizeName("A  B  C  D")).toBe("A B C D");
  });
});
