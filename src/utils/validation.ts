export const validation = {
    // Number validation
    isPositiveNumber: (value: unknown): value is number => {
        return typeof value === 'number' && !isNaN(value) && value >= 0;
    },

    isValidPercentage: (value: unknown): value is number => {
        return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100;
    },

    // String validation
    isNonEmptyString: (value: unknown): value is string => {
        return typeof value === 'string' && value.trim().length > 0;
    },

    isValidTicker: (value: unknown): value is string => {
        return typeof value === 'string' && /^[A-Z]{1,5}$/.test(value.trim().toUpperCase());
    },

    // Currency validation
    parseAmount: (value: string | number): number => {
        if (typeof value === 'number') return Math.max(0, value);
        
        // Remove currency symbols and whitespace
        const cleaned = value.replace(/[$,\s]/g, '');
        const parsed = parseFloat(cleaned);
        
        return !isNaN(parsed) ? Math.max(0, parsed) : 0;
    },

    // Portfolio validation
    validateAllocationSum: (portfolio: { allocation: number }[]): string | null => {
        const total = portfolio.reduce((sum, item) => sum + (item.allocation || 0), 0);
        if (Math.abs(total - 100) > 0.01) { // Allow small floating point differences
            return `Total allocation is ${total.toFixed(1)}%. Must equal 100%.`;
        }
        return null;
    },

    // Array validation
    hasMinimumItems: (array: unknown[], min: number): boolean => {
        return Array.isArray(array) && array.length >= min;
    },

    // Sanitization
    sanitizeTicker: (ticker: string): string => {
        return ticker.trim().toUpperCase().replace(/[^A-Z]/g, '');
    },

    sanitizeName: (name: string): string => {
        return name.trim().replace(/\s+/g, ' ');
    },
} as const;

// Type guards for better TypeScript support
export interface ValidationResult<T> {
    isValid: boolean;
    value?: T;
    error?: string;
}

export const validateAndTransform = {
    percentage: (value: unknown): ValidationResult<number> => {
        if (validation.isValidPercentage(value)) {
            return { isValid: true, value };
        }
        return { 
            isValid: false, 
            error: 'Must be a number between 0 and 100' 
        };
    },

    amount: (value: unknown): ValidationResult<number> => {
        try {
            const parsed = typeof value === 'string' ? validation.parseAmount(value) : value;
            if (validation.isPositiveNumber(parsed)) {
                return { isValid: true, value: parsed };
            }
        } catch {
            // parsing failed
        }
        return { 
            isValid: false, 
            error: 'Must be a positive number' 
        };
    },

    ticker: (value: unknown): ValidationResult<string> => {
        if (typeof value === 'string') {
            const sanitized = validation.sanitizeTicker(value);
            if (validation.isValidTicker(sanitized)) {
                return { isValid: true, value: sanitized };
            }
        }
        return { 
            isValid: false, 
            error: 'Must be 1-5 uppercase letters' 
        };
    },

    name: (value: unknown): ValidationResult<string> => {
        if (typeof value === 'string') {
            const sanitized = validation.sanitizeName(value);
            if (validation.isNonEmptyString(sanitized)) {
                return { isValid: true, value: sanitized };
            }
        }
        return { 
            isValid: false, 
            error: 'Name is required' 
        };
    },
};
