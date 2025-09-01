// Storage configuration
export const STORAGE = {
  KEY: "rebalancer-portfolio-data",
  VERSION: "1.0.0",
  AUTO_SAVE_DELAY_MS: 1000,
} as const;

// UI configuration
export const UI = {
  INPUT_SIZE: "sm",
  ICON_SIZE: 16,
  LARGE_ICON_SIZE: 18,
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: "Required",
  ASSET_CLASS_NAME_REQUIRED: "Asset class name is required",
  ALLOCATION_REQUIRED: "Allocation is required",
  TICKER_REQUIRED: "Ticker is required",
  MUST_HAVE_ACCOUNT: "Must have at least one account",
  MUST_HAVE_ASSET_CLASS: "Must have at least one asset class",
  MUST_HAVE_FUND: "Must have at least one fund",
  TOTAL_ALLOCATION_ERROR: "Total allocation must equal 100%",
  STORAGE_QUOTA_EXCEEDED:
    "Storage quota exceeded. Please clear some browser data or export your portfolio data as backup.",
  INVALID_PORTFOLIO_DATA:
    "Invalid portfolio data found in localStorage, using defaults",
  EXPORT_SUCCESS: "Your portfolio data has been downloaded",
  EXPORT_FAILED: "Failed to export portfolio data",
  IMPORT_SUCCESS: "Your portfolio data has been loaded",
  IMPORT_FAILED: "Failed to import portfolio data",
  INVALID_FILE_FORMAT: "Invalid portfolio data format",
  PARSE_JSON_FAILED: "Failed to parse JSON file",
  READ_FILE_FAILED: "Failed to read file",
  CLEAR_DATA_CONFIRMATION:
    "Are you sure you want to clear all data? This action cannot be undone. Consider exporting your data first.",
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

// File naming
export const FILE_PATTERNS = {
  BACKUP_PREFIX: "rebalancer-backup-",
  BACKUP_EXTENSION: ".json",
} as const;

// Form validation
export const VALIDATION = {
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  TARGET_ALLOCATION_SUM: 100,
  MIN_ASSET_CLASSES: 1,
  MIN_ACCOUNTS: 1,
  MIN_FUNDS_PER_ASSET_CLASS: 1,
} as const;
