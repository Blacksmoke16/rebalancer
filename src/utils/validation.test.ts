import { describe, it, expect } from 'vitest';
import { validation, validateAndTransform } from './validation';

describe('Validation Utilities', () => {
  describe('validation.isValidPercentage', () => {
    it('should return true for valid percentage numbers', () => {
      expect(validation.isValidPercentage(0)).toBe(true);
      expect(validation.isValidPercentage(50)).toBe(true);
      expect(validation.isValidPercentage(100)).toBe(true);
      expect(validation.isValidPercentage(25.5)).toBe(true);
    });

    it('should return false for invalid percentage numbers', () => {
      expect(validation.isValidPercentage(-1)).toBe(false);
      expect(validation.isValidPercentage(101)).toBe(false);
      expect(validation.isValidPercentage(-0.1)).toBe(false);
      expect(validation.isValidPercentage(100.1)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(validation.isValidPercentage('50')).toBe(false);
      expect(validation.isValidPercentage(null)).toBe(false);
      expect(validation.isValidPercentage(undefined)).toBe(false);
      expect(validation.isValidPercentage({})).toBe(false);
      expect(validation.isValidPercentage([])).toBe(false);
      expect(validation.isValidPercentage(NaN)).toBe(false);
      expect(validation.isValidPercentage(Infinity)).toBe(false);
    });
  });

  describe('validation.isPositiveNumber', () => {
    it('should return true for valid positive numbers', () => {
      expect(validation.isPositiveNumber(0)).toBe(true);
      expect(validation.isPositiveNumber(100)).toBe(true);
      expect(validation.isPositiveNumber(1000.50)).toBe(true);
      expect(validation.isPositiveNumber(0.01)).toBe(true);
    });

    it('should return false for negative amounts', () => {
      expect(validation.isPositiveNumber(-1)).toBe(false);
      expect(validation.isPositiveNumber(-0.01)).toBe(false);
    });

    it('should return false for non-numbers', () => {
      expect(validation.isPositiveNumber('100')).toBe(false);
      expect(validation.isPositiveNumber(null)).toBe(false);
      expect(validation.isPositiveNumber(undefined)).toBe(false);
      expect(validation.isPositiveNumber(NaN)).toBe(false);
      expect(validation.isPositiveNumber(Infinity)).toBe(true); // Infinity is a valid positive number
    });
  });

  describe('validation.parseAmount', () => {
    it('should parse valid number inputs', () => {
      expect(validation.parseAmount(100)).toBe(100);
      expect(validation.parseAmount(0)).toBe(0);
      expect(validation.parseAmount(1000.50)).toBe(1000.50);
    });

    it('should parse valid string inputs', () => {
      expect(validation.parseAmount('100')).toBe(100);
      expect(validation.parseAmount('$100')).toBe(100);
      expect(validation.parseAmount('1,000.50')).toBe(1000.50);
      expect(validation.parseAmount('$ 1,000.50 ')).toBe(1000.50);
    });

    it('should handle negative values by making them zero', () => {
      expect(validation.parseAmount(-100)).toBe(0);
      expect(validation.parseAmount('-100')).toBe(0);
    });

    it('should return zero for invalid inputs', () => {
      expect(validation.parseAmount('abc')).toBe(0);
      expect(validation.parseAmount('')).toBe(0);
      expect(validation.parseAmount('$')).toBe(0);
    });
  });

  describe('validation.isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(validation.isNonEmptyString('test')).toBe(true);
      expect(validation.isNonEmptyString('a')).toBe(true);
      expect(validation.isNonEmptyString('  test  ')).toBe(true);
    });

    it('should return false for empty or whitespace-only strings', () => {
      expect(validation.isNonEmptyString('')).toBe(false);
      expect(validation.isNonEmptyString('   ')).toBe(false);
      expect(validation.isNonEmptyString('\t\n')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(validation.isNonEmptyString(123)).toBe(false);
      expect(validation.isNonEmptyString(null)).toBe(false);
      expect(validation.isNonEmptyString(undefined)).toBe(false);
      expect(validation.isNonEmptyString({})).toBe(false);
      expect(validation.isNonEmptyString([])).toBe(false);
    });
  });

  describe('validation.isValidTicker', () => {
    it('should return true for valid ticker strings', () => {
      expect(validation.isValidTicker('VTI')).toBe(true);
      expect(validation.isValidTicker('VXUS')).toBe(true);
      expect(validation.isValidTicker('BND')).toBe(true);
      expect(validation.isValidTicker('A')).toBe(true);
    });

    it('should return true for lowercase tickers', () => {
      expect(validation.isValidTicker('vti')).toBe(true);
      expect(validation.isValidTicker('vxus')).toBe(true);
    });

    it('should return false for empty or invalid tickers', () => {
      expect(validation.isValidTicker('')).toBe(false);
      expect(validation.isValidTicker('   ')).toBe(false);
      expect(validation.isValidTicker('VTI123')).toBe(false);
      expect(validation.isValidTicker('VTI-A')).toBe(false);
      expect(validation.isValidTicker('VTI.A')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(validation.isValidTicker(123)).toBe(false);
      expect(validation.isValidTicker(null)).toBe(false);
      expect(validation.isValidTicker(undefined)).toBe(false);
    });
  });

  describe('validation.hasMinimumItems', () => {
    it('should return true for arrays with sufficient items', () => {
      expect(validation.hasMinimumItems([1, 2, 3], 2)).toBe(true);
      expect(validation.hasMinimumItems([1, 2, 3], 3)).toBe(true);
      expect(validation.hasMinimumItems(['a'], 1)).toBe(true);
      expect(validation.hasMinimumItems([], 0)).toBe(true);
    });

    it('should return false for arrays with insufficient items', () => {
      expect(validation.hasMinimumItems([1, 2], 3)).toBe(false);
      expect(validation.hasMinimumItems([], 1)).toBe(false);
      expect(validation.hasMinimumItems(['a'], 2)).toBe(false);
    });

    it('should return false for non-arrays', () => {
      expect(validation.hasMinimumItems('abc' as any, 1)).toBe(false);
      expect(validation.hasMinimumItems(123 as any, 1)).toBe(false);
      expect(validation.hasMinimumItems(null as any, 0)).toBe(false);
      expect(validation.hasMinimumItems(undefined as any, 0)).toBe(false);
    });
  });

  describe('validation.sanitizeTicker', () => {
    it('should convert to uppercase and remove non-letters', () => {
      expect(validation.sanitizeTicker('vti')).toBe('VTI');
      expect(validation.sanitizeTicker('VTI123')).toBe('VTI');
      expect(validation.sanitizeTicker('VTI-A')).toBe('VTIA');
      expect(validation.sanitizeTicker('V.T.I')).toBe('VTI');
    });

    it('should trim whitespace', () => {
      expect(validation.sanitizeTicker('  VTI  ')).toBe('VTI');
      expect(validation.sanitizeTicker('\tvti\n')).toBe('VTI');
    });

    it('should handle empty strings', () => {
      expect(validation.sanitizeTicker('')).toBe('');
      expect(validation.sanitizeTicker('   ')).toBe('');
      expect(validation.sanitizeTicker('123')).toBe('');
    });
  });

  describe('validation.sanitizeName', () => {
    it('should trim and normalize whitespace', () => {
      expect(validation.sanitizeName('Test Name')).toBe('Test Name');
      expect(validation.sanitizeName('  Test   Name  ')).toBe('Test Name');
      expect(validation.sanitizeName('Test\t\nName')).toBe('Test Name');
    });

    it('should handle empty strings', () => {
      expect(validation.sanitizeName('')).toBe('');
      expect(validation.sanitizeName('   ')).toBe('');
    });

    it('should collapse multiple spaces', () => {
      expect(validation.sanitizeName('Test     Name')).toBe('Test Name');
      expect(validation.sanitizeName('A  B  C  D')).toBe('A B C D');
    });
  });

  describe('validation.validateAllocationSum', () => {
    it('should return null for allocations that sum to 100', () => {
      const portfolio = [
        { allocation: 50 },
        { allocation: 30 },
        { allocation: 20 },
      ];
      expect(validation.validateAllocationSum(portfolio)).toBe(null);
    });

    it('should return error for allocations that do not sum to 100', () => {
      const portfolio = [
        { allocation: 50 },
        { allocation: 30 },
        { allocation: 30 }, // Total: 110
      ];
      const result = validation.validateAllocationSum(portfolio);
      expect(result).toBe('Total allocation is 110.0%. Must equal 100%.');
    });

    it('should handle floating point differences', () => {
      const portfolio = [
        { allocation: 33.33 },
        { allocation: 33.33 },
        { allocation: 33.34 },
      ];
      expect(validation.validateAllocationSum(portfolio)).toBe(null);
    });

    it('should handle missing allocation values', () => {
      const portfolio = [
        { allocation: 50 },
        {}, // No allocation property
        { allocation: 30 },
      ] as any;
      const result = validation.validateAllocationSum(portfolio);
      expect(result).toBe('Total allocation is 80.0%. Must equal 100%.');
    });
  });
});

describe('validateAndTransform', () => {
  describe('validateAndTransform.percentage', () => {
    it('should return valid result for valid percentages', () => {
      const result1 = validateAndTransform.percentage(50);
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(50);
      expect(result1.error).toBeUndefined();

      const result2 = validateAndTransform.percentage(0);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(0);

      const result3 = validateAndTransform.percentage(100);
      expect(result3.isValid).toBe(true);
      expect(result3.value).toBe(100);
    });

    it('should return invalid result for invalid percentages', () => {
      const result1 = validateAndTransform.percentage(-1);
      expect(result1.isValid).toBe(false);
      expect(result1.value).toBeUndefined();
      expect(result1.error).toBe('Must be a number between 0 and 100');

      const result2 = validateAndTransform.percentage(101);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Must be a number between 0 and 100');

      const result3 = validateAndTransform.percentage('50' as any);
      expect(result3.isValid).toBe(false);
      expect(result3.error).toBe('Must be a number between 0 and 100');
    });
  });

  describe('validateAndTransform.amount', () => {
    it('should return valid result for valid numbers', () => {
      const result1 = validateAndTransform.amount(100);
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(100);
      expect(result1.error).toBeUndefined();

      const result2 = validateAndTransform.amount(0);
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(0);
    });

    it('should return valid result for valid string amounts', () => {
      const result1 = validateAndTransform.amount('100');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe(100);

      const result2 = validateAndTransform.amount('$1,000.50');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe(1000.50);
    });

    it('should return invalid result for negative values', () => {
      const result1 = validateAndTransform.amount(-100);
      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('Must be a positive number');
    });

    it('should handle valid zero values parsed from strings with negatives', () => {
      const result = validateAndTransform.amount('-100');
      expect(result.isValid).toBe(true);
      expect(result.value).toBe(0); // parseAmount converts negative strings to 0
    });

    it('should return valid result for unparseable strings that become zero', () => {
      const result1 = validateAndTransform.amount('abc');
      expect(result1.isValid).toBe(true); // parseAmount returns 0 for invalid strings
      expect(result1.value).toBe(0);
    });

    it('should return invalid result for non-string non-number values', () => {
      const result2 = validateAndTransform.amount(null);
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Must be a positive number');
    });
  });

  describe('validateAndTransform.ticker', () => {
    it('should return valid result for valid tickers', () => {
      const result1 = validateAndTransform.ticker('VTI');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe('VTI');
      expect(result1.error).toBeUndefined();

      const result2 = validateAndTransform.ticker('vti');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('VTI');
    });

    it('should sanitize and validate tickers', () => {
      const result1 = validateAndTransform.ticker('  vti  ');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe('VTI');

      const result2 = validateAndTransform.ticker('VTI123');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('VTI');
    });

    it('should return invalid result for invalid tickers', () => {
      const result1 = validateAndTransform.ticker('');
      expect(result1.isValid).toBe(false);
      expect(result1.value).toBeUndefined();
      expect(result1.error).toBe('Must be 1-5 uppercase letters');

      const result2 = validateAndTransform.ticker('123');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Must be 1-5 uppercase letters');
    });
  });

  describe('validateAndTransform.name', () => {
    it('should return valid result for valid names', () => {
      const result1 = validateAndTransform.name('Test Name');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe('Test Name');
      expect(result1.error).toBeUndefined();
    });

    it('should sanitize names', () => {
      const result1 = validateAndTransform.name('  Test   Name  ');
      expect(result1.isValid).toBe(true);
      expect(result1.value).toBe('Test Name');

      const result2 = validateAndTransform.name('Test\t\nName');
      expect(result2.isValid).toBe(true);
      expect(result2.value).toBe('Test Name');
    });

    it('should return invalid result for empty names', () => {
      const result1 = validateAndTransform.name('');
      expect(result1.isValid).toBe(false);
      expect(result1.value).toBeUndefined();
      expect(result1.error).toBe('Name is required');

      const result2 = validateAndTransform.name('   ');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('Name is required');
    });
  });
});
