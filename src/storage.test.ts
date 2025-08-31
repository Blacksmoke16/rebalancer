import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  savePortfolioData,
  loadPortfolioData,
  clearPortfolioData,
  getDefaultPortfolioData,
  exportPortfolioData,
  importPortfolioData,
} from './storage';
import { createMockPortfolioData } from './test/utils';
import { createDollarAmount } from './types/branded';

// Mock file download and URL creation
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

(global as any).URL = {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
};

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = vi.fn((tagName: string) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
      style: { display: '' },
    } as any;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock document.body
Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('savePortfolioData', () => {
    it('should save portfolio data to localStorage', () => {
      const mockData = createMockPortfolioData();
      
      savePortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'rebalancer-portfolio-data',
        expect.stringContaining('"accounts"')
      );

      const savedData = JSON.parse((localStorage.setItem as any).mock.calls[0][1]);
      expect(savedData).toMatchObject({
        accounts: mockData.accounts,
        portfolio: mockData.portfolio,
        toInvest: mockData.toInvest,
        version: expect.any(String),
        lastSaved: expect.any(String),
      });
    });

    it('should handle localStorage errors gracefully', () => {
      const mockData = createMockPortfolioData();
      
      // Mock localStorage.setItem to throw an error
      (localStorage.setItem as any).mockImplementation(() => {
        throw new Error('localStorage is full');
      });

      // Should not throw an error
      expect(() => {
        savePortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to save portfolio data to localStorage:',
        expect.any(Error)
      );
    });

    it('should handle quota exceeded errors with alert', () => {
      const mockData = createMockPortfolioData();
      
      // Mock localStorage.setItem to throw a quota exceeded error
      const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
      (localStorage.setItem as any).mockImplementation(() => {
        throw quotaError;
      });

      savePortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);

      expect((global as any).alert).toHaveBeenCalledWith(
        'Storage quota exceeded. Please clear some browser data or export your portfolio data as backup.'
      );
    });
  });

  describe('loadPortfolioData', () => {
    it('should load portfolio data from localStorage', () => {
      const mockData = createMockPortfolioData();
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(mockData));

      const result = loadPortfolioData();

      expect(localStorage.getItem).toHaveBeenCalledWith('rebalancer-portfolio-data');
      expect(result).toEqual(mockData);
    });

    it('should return null if no data exists', () => {
      (localStorage.getItem as any).mockReturnValue(null);

      const result = loadPortfolioData();

      expect(result).toBe(null);
    });

    it('should return null if data is invalid JSON', () => {
      (localStorage.getItem as any).mockReturnValue('invalid json');

      const result = loadPortfolioData();

      expect(result).toBe(null);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load portfolio data from localStorage'
      );
    });

    it('should return null if data fails validation', () => {
      const invalidData = { invalid: 'data' };
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(invalidData));

      const result = loadPortfolioData();

      expect(result).toBe(null);
    });
  });

  describe('clearPortfolioData', () => {
    it('should remove portfolio data from localStorage', () => {
      clearPortfolioData();

      expect(localStorage.removeItem).toHaveBeenCalledWith('rebalancer-portfolio-data');
    });

    it('should handle localStorage errors gracefully', () => {
      (localStorage.removeItem as any).mockImplementation(() => {
        throw new Error('localStorage error');
      });

      // Should not throw an error
      expect(() => {
        clearPortfolioData();
      }).not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear portfolio data'
      );
    });
  });

  describe('getDefaultPortfolioData', () => {
    it('should return default portfolio data structure', () => {
      const result = getDefaultPortfolioData();

      expect(result).toMatchObject({
        accounts: expect.arrayContaining([
          expect.objectContaining({ name: expect.any(String), key: expect.any(String) })
        ]),
        portfolio: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            allocation: expect.any(Number),
            funds: expect.any(Array),
            key: expect.any(String),
          })
        ]),
        toInvest: createDollarAmount(0),
        version: expect.any(String),
        lastSaved: expect.any(String),
      });
    });

    it('should include default accounts', () => {
      const result = getDefaultPortfolioData();

      expect(result.accounts).toHaveLength(3);
      expect(result.accounts.map(a => a.name)).toEqual([
        '401k',
        'Roth IRA', 
        'Vanguard Brokerage'
      ]);
    });

    it('should include default asset classes', () => {
      const result = getDefaultPortfolioData();

      expect(result.portfolio).toHaveLength(3);
      const assetClassNames = result.portfolio.map(p => p.name);
      expect(assetClassNames).toContain('US Total Stock Market');
      expect(assetClassNames).toContain('International Total Stock Market');
      expect(assetClassNames).toContain('US Total Bond Market');
    });

    it('should have allocations that sum to 100%', () => {
      const result = getDefaultPortfolioData();

      const totalAllocation = result.portfolio.reduce((sum, p) => sum + p.allocation, 0);
      expect(totalAllocation).toBe(100);
    });
  });

  describe('exportPortfolioData', () => {
    it('should trigger file download with correct data', () => {
      const mockData = createMockPortfolioData();
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      exportPortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);

      // Check that a blob URL was created
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      
      // Check that download link was created and clicked
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      
      // Check that cleanup happened
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should use correct filename format', () => {
      const mockData = createMockPortfolioData();
      mockCreateObjectURL.mockReturnValue('blob:mock-url');

      exportPortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);

      const linkElement = (document.createElement as any).mock.results.find(
        (result: any) => result.value.download !== undefined
      )?.value;
      
      expect(linkElement.download).toMatch(/rebalancer-backup-\d{4}-\d{2}-\d{2}\.json/);
    });

    it('should handle export errors gracefully', () => {
      const mockData = createMockPortfolioData();
      mockCreateObjectURL.mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      // Should throw an error since there's no try-catch in exportPortfolioData
      expect(() => {
        exportPortfolioData(mockData.accounts, mockData.portfolio, mockData.toInvest);
      }).toThrow('Blob creation failed');
    });
  });

  describe('importPortfolioData', () => {
    it('should read and parse valid JSON file', async () => {
      const mockData = createMockPortfolioData();
      const mockFile = new File([JSON.stringify(mockData)], 'portfolio.json', {
        type: 'application/json',
      });

      const result = await importPortfolioData(mockFile);

      expect(result).toEqual(mockData);
    });

    it('should reject invalid JSON files', async () => {
      const mockFile = new File(['invalid json'], 'portfolio.json', {
        type: 'application/json',
      });

      await expect(importPortfolioData(mockFile)).rejects.toThrow('Failed to parse JSON file');
    });

    it('should reject files that fail validation', async () => {
      const invalidData = { invalid: 'data' };
      const mockFile = new File([JSON.stringify(invalidData)], 'portfolio.json', {
        type: 'application/json',
      });

      await expect(importPortfolioData(mockFile)).rejects.toThrow('Invalid portfolio data format');
    });

    it('should handle file reading errors', async () => {
      const mockFile = new File(['test'], 'portfolio.json');

      // Mock FileReader to trigger error
      const mockFileReader = {
        readAsText: vi.fn().mockImplementation(function(this: any) {
          // Simulate FileReader error
          setTimeout(() => this.onerror?.(), 0);
        }),
        onerror: null,
        onload: null,
      };
      
      (global as any).FileReader = vi.fn(() => mockFileReader);

      await expect(importPortfolioData(mockFile)).rejects.toThrow('Failed to read file');
    });
  });

  describe('Data Validation', () => {
    it('should validate required portfolio data fields', () => {
      const validData = createMockPortfolioData();
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(validData));
      
      expect(loadPortfolioData()).toEqual(validData);
      
      // Test missing required fields
      const invalidCases = [
        { ...validData, accounts: undefined },
        { ...validData, portfolio: undefined },
        { ...validData, toInvest: undefined },
        { ...validData, version: undefined },
        { accounts: 'not an array' },
        { ...validData, accounts: [{ invalidAccount: true }] },
        { ...validData, portfolio: [{ invalidPortfolio: true }] },
      ];
      
      invalidCases.forEach((invalidData) => {
        (localStorage.getItem as any).mockReturnValue(JSON.stringify(invalidData));
        expect(loadPortfolioData()).toBe(null);
      });
    });
  });
});