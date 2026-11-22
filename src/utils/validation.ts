import { FundUnit } from "../types";

// Letters, digits, spaces and "/" so one fund row can list equivalent share
// classes, e.g. "VTSAX / VTI".
const TICKER_PATTERN = /^[A-Z0-9\s/]+$/i;

// Share funds are priced by ticker, so they need one symbol as Yahoo Finance
// writes it, e.g. "BRK-B", "BTC-USD", or "EURUSD=X".
const SYMBOL_PATTERN = /^[A-Z0-9.=-]+$/i;

export function validateTicker(value: string, unit: FundUnit): string | null {
  if (unit === "shares") {
    return SYMBOL_PATTERN.test(value.trim())
      ? null
      : "Use a single ticker symbol, like VTI or BRK-B";
  }
  return TICKER_PATTERN.test(value.trim()) ? null : "Ticker is required";
}

export function validateAllocationSum(
  portfolio: { allocation: number }[],
): string | null {
  const total = portfolio.reduce(
    (sum, item) => sum + (item.allocation || 0),
    0,
  );
  if (Math.abs(total - 100) > 0.01) {
    // Allow small floating point differences
    return `Total allocation is ${total.toFixed(1)}%. Must equal 100%.`;
  }
  return null;
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
