import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDollars,
  formatPrice,
  formatShareChange,
  formatShares,
} from "./format";

describe("formatDollars", () => {
  it("rounds to whole dollars with thousands separators", () => {
    expect(formatDollars(3730)).toBe("$3,730");
    expect(formatDollars(3729.6)).toBe("$3,730");
    expect(formatDollars(0)).toBe("$0");
  });
});

describe("formatPrice", () => {
  it("keeps cents", () => {
    expect(formatPrice(297.15)).toBe("$297.15");
    expect(formatPrice(1200)).toBe("$1,200.00");
  });

  it("keeps up to 4 decimal places for sub-cent prices", () => {
    expect(formatPrice(0.12345)).toBe("$0.1235");
  });
});

describe("formatShares", () => {
  it("keeps up to 6 decimal places", () => {
    expect(formatShares(12.552583)).toBe("12.552583");
    expect(formatShares(1500)).toBe("1,500");
    expect(formatShares(0.5)).toBe("0.5");
  });
});

describe("formatShareChange", () => {
  it("signs buys and sells", () => {
    expect(formatShareChange(4)).toBe("+4");
    expect(formatShareChange(-3.3653041)).toBe("-3.365304");
  });
});

describe("formatDate", () => {
  it("formats an ISO timestamp as a medium date", () => {
    expect(formatDate("2026-11-20T17:00:00.000Z")).toBe("Nov 20, 2026");
  });
});
