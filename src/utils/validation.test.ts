import { describe, it, expect } from "vitest";
import {
  sanitizeName,
  validateAllocationSum,
  validateTicker,
} from "./validation";

describe("validateTicker", () => {
  it("should accept valid ticker strings", () => {
    expect(validateTicker("VTI")).toBe(null);
    expect(validateTicker("VXUS")).toBe(null);
    expect(validateTicker("BND")).toBe(null);
    expect(validateTicker("A")).toBe(null);
  });

  it("should accept lowercase tickers", () => {
    expect(validateTicker("vti")).toBe(null);
    expect(validateTicker("vxus")).toBe(null);
  });

  it("should accept multiple tickers with slash", () => {
    expect(validateTicker("VTSAX / VTI")).toBe(null);
    expect(validateTicker("VTI/VTSAX")).toBe(null);
  });

  it("should accept tickers with numbers", () => {
    expect(validateTicker("VTI123")).toBe(null);
    expect(validateTicker("FUND1")).toBe(null);
  });

  it("should accept tickers with surrounding whitespace", () => {
    expect(validateTicker("  vti  ")).toBe(null);
  });

  it("should reject empty or invalid tickers", () => {
    expect(validateTicker("")).toBe("Ticker is required");
    expect(validateTicker("   ")).toBe("Ticker is required");
    expect(validateTicker("VTI-A")).toBe("Ticker is required");
    expect(validateTicker("VTI.A")).toBe("Ticker is required");
    expect(validateTicker("VTI@")).toBe("Ticker is required");
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
