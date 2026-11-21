// Letters, digits, spaces and "/" so one fund row can list equivalent share
// classes, e.g. "VTSAX / VTI".
const TICKER_PATTERN = /^[A-Z0-9\s/]+$/i;

export function validateTicker(value: string): string | null {
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
