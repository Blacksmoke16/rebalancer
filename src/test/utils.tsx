import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { PortfolioProvider } from '../contexts/PortfolioProvider';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MantineProvider>
      <Notifications />
      <PortfolioProvider>
        {children}
      </PortfolioProvider>
    </MantineProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Custom render without PortfolioProvider for testing provider itself
const renderWithMantine = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const MantineWrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <Notifications />
      {children}
    </MantineProvider>
  );
  
  return render(ui, { wrapper: MantineWrapper, ...options });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, customRender as renderWithProviders, renderWithMantine };

// Mock data helpers
export const mockAccount = (name = 'Test Account') => ({
  name,
  key: `test-key-${name.toLowerCase().replace(' ', '-')}` as any,
});

export const mockAssetClass = (name = 'Test Asset Class', allocation = 50) => ({
  name,
  allocation: allocation as any,
  funds: [],
  key: `test-key-${name.toLowerCase().replace(' ', '-')}` as any,
});

export const mockFund = (ticker = 'VTI') => ({
  ticker: ticker as any,
  values: {},
  key: `test-key-${ticker.toLowerCase()}`,
});

// Test data generators
export const createMockPortfolioData = () => ({
  accounts: [
    mockAccount('401k'),
    mockAccount('Roth IRA'),
    mockAccount('Brokerage'),
  ],
  portfolio: [
    {
      ...mockAssetClass('US Total Stock Market', 60),
      funds: [mockFund('VTI')],
    },
    {
      ...mockAssetClass('International Stocks', 30),
      funds: [mockFund('VXUS')],
    },
    {
      ...mockAssetClass('Bonds', 10),
      funds: [mockFund('BND')],
    },
  ],
  toInvest: 10000 as any,
  version: '1.0.0',
  lastSaved: new Date().toISOString(),
});

// Mock localStorage data
export const mockLocalStorageData = () => {
  const data = createMockPortfolioData();
  return JSON.stringify(data);
};

// Helper to wait for async updates
export const waitForNextUpdate = () => new Promise(resolve => setTimeout(resolve, 0));