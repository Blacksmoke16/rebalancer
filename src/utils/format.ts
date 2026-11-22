// Whole dollars, like the rest of the app's dollar amounts: "$3,730".
export function formatDollars(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

// Prices keep their cents, and up to 4 decimal places for sub-cent quotes.
export function formatPrice(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;
}

// Up to 6 decimal places, the precision share counts are kept at.
export function formatShares(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

// A planned change in shares, signed: "+4" or "-3.365304".
export function formatShareChange(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
    signDisplay: "exceptZero",
  });
}

// A date in the user's locale, e.g. "Nov 22, 2026".
export function formatDate(isoTimestamp: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(isoTimestamp),
  );
}

// A date and time in the user's locale, e.g. "Nov 22, 2026, 9:14 AM".
export function formatDateTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoTimestamp));
}
