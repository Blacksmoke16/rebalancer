import { describe, it, expect } from 'vitest';
import {
  createPercentage,
  createDollarAmount,
  createAccountId,
  createAssetClassId,
  createFundTicker,
  type Percentage,
  type DollarAmount,
  type AccountId,
  type AssetClassId,
  type FundTicker,
} from './branded';

describe('Branded Types', () => {
  describe('createPercentage', () => {
    it('should create valid percentage for values between 0 and 100', () => {
      expect(createPercentage(0)).toBe(0);
      expect(createPercentage(50)).toBe(50);
      expect(createPercentage(100)).toBe(100);
      expect(createPercentage(25.5)).toBe(25.5);
    });

    it('should throw error for values less than 0', () => {
      expect(() => createPercentage(-1)).toThrow('Invalid percentage: -1. Must be between 0 and 100.');
      expect(() => createPercentage(-0.1)).toThrow('Invalid percentage: -0.1. Must be between 0 and 100.');
    });

    it('should throw error for values greater than 100', () => {
      expect(() => createPercentage(101)).toThrow('Invalid percentage: 101. Must be between 0 and 100.');
      expect(() => createPercentage(100.1)).toThrow('Invalid percentage: 100.1. Must be between 0 and 100.');
    });

    it('should create branded type that is distinct from number', () => {
      const percentage: Percentage = createPercentage(50);
      const number = 50;
      
      // TypeScript would catch this at compile time, but at runtime they're equal
      expect(percentage).toBe(number);
      expect(typeof percentage).toBe('number');
    });
  });

  describe('createDollarAmount', () => {
    it('should create valid dollar amounts for non-negative values', () => {
      expect(createDollarAmount(0)).toBe(0);
      expect(createDollarAmount(100)).toBe(100);
      expect(createDollarAmount(1000.50)).toBe(1001); // Rounds to nearest dollar
      expect(createDollarAmount(999.49)).toBe(999);
    });

    it('should round to nearest dollar', () => {
      expect(createDollarAmount(10.4)).toBe(10);
      expect(createDollarAmount(10.5)).toBe(11);
      expect(createDollarAmount(10.6)).toBe(11);
      expect(createDollarAmount(999.99)).toBe(1000);
    });

    it('should throw error for negative values', () => {
      expect(() => createDollarAmount(-1)).toThrow('Invalid dollar amount: -1. Must be non-negative.');
      expect(() => createDollarAmount(-0.01)).toThrow('Invalid dollar amount: -0.01. Must be non-negative.');
    });

    it('should create branded type that is distinct from number', () => {
      const dollarAmount: DollarAmount = createDollarAmount(100);
      const number = 100;
      
      expect(dollarAmount).toBe(number);
      expect(typeof dollarAmount).toBe('number');
    });
  });

  describe('createAccountId', () => {
    it('should create valid account IDs for non-empty strings', () => {
      expect(createAccountId('test')).toBe('test');
      expect(createAccountId('401k')).toBe('401k');
      expect(createAccountId('roth-ira-2024')).toBe('roth-ira-2024');
    });

    it('should trim whitespace', () => {
      expect(createAccountId('  test  ')).toBe('test');
      expect(createAccountId('\t401k\n')).toBe('401k');
    });

    it('should throw error for empty strings', () => {
      expect(() => createAccountId('')).toThrow('Account ID cannot be empty');
      expect(() => createAccountId('   ')).toThrow('Account ID cannot be empty');
      expect(() => createAccountId('\t\n')).toThrow('Account ID cannot be empty');
    });

    it('should create branded type that is distinct from string', () => {
      const accountId: AccountId = createAccountId('test');
      const string = 'test';
      
      expect(accountId).toBe(string);
      expect(typeof accountId).toBe('string');
    });
  });

  describe('createAssetClassId', () => {
    it('should create valid asset class IDs for non-empty strings', () => {
      expect(createAssetClassId('stocks')).toBe('stocks');
      expect(createAssetClassId('bonds-international')).toBe('bonds-international');
    });

    it('should trim whitespace', () => {
      expect(createAssetClassId('  stocks  ')).toBe('stocks');
      expect(createAssetClassId('\tbonds\n')).toBe('bonds');
    });

    it('should throw error for empty strings', () => {
      expect(() => createAssetClassId('')).toThrow('Asset class ID cannot be empty');
      expect(() => createAssetClassId('   ')).toThrow('Asset class ID cannot be empty');
    });

    it('should create branded type that is distinct from string', () => {
      const assetClassId: AssetClassId = createAssetClassId('stocks');
      const string = 'stocks';
      
      expect(assetClassId).toBe(string);
      expect(typeof assetClassId).toBe('string');
    });
  });

  describe('createFundTicker', () => {
    it('should create valid fund tickers for non-empty strings', () => {
      expect(createFundTicker('VTI')).toBe('VTI');
      expect(createFundTicker('VXUS')).toBe('VXUS');
      expect(createFundTicker('BND')).toBe('BND');
    });

    it('should convert to uppercase', () => {
      expect(createFundTicker('vti')).toBe('VTI');
      expect(createFundTicker('vxus')).toBe('VXUS');
      expect(createFundTicker('bnd')).toBe('BND');
    });

    it('should trim whitespace and convert to uppercase', () => {
      expect(createFundTicker('  vti  ')).toBe('VTI');
      expect(createFundTicker('\tvxus\n')).toBe('VXUS');
    });

    it('should throw error for empty strings', () => {
      expect(() => createFundTicker('')).toThrow('Fund ticker cannot be empty');
      expect(() => createFundTicker('   ')).toThrow('Fund ticker cannot be empty');
    });

    it('should create branded type that is distinct from string', () => {
      const fundTicker: FundTicker = createFundTicker('VTI');
      const string = 'VTI';
      
      expect(fundTicker).toBe(string);
      expect(typeof fundTicker).toBe('string');
    });
  });
});