// Storage configuration
export const STORAGE = {
  KEY: "rebalancer-portfolio-data",
  VERSION: "1.0.0",
  AUTO_SAVE_DELAY_MS: 1000,
} as const;

// UI configuration
export const UI = {
  INPUT_SIZE: "sm",
} as const;

// Number formatting
export const FORMATTING = {
  THOUSAND_SEPARATOR: ",",
  DOLLAR_PREFIX: "$",
  PERCENT_SUFFIX: "%",
  DECIMAL_PLACES: {
    CURRENCY: 0,
    PERCENTAGE: 2,
  },
} as const;

// Colors for delta values
export const DELTA_COLORS = {
  POSITIVE: "green.6",
  NEGATIVE: "red.6",
  NEUTRAL: undefined, // Use default color
} as const;

// Form validation
export const VALIDATION = {
  TARGET_ALLOCATION_SUM: 100,
} as const;
