import { STORAGE } from './constants';
import { Account, AssetClass, PortfolioData } from './types';
import { defaultAccounts, defaultAssetClasses } from './utils';

export function savePortfolioData(accounts: Account[], portfolio: AssetClass[], toInvest: number): void {
    try {
        const data: PortfolioData = {
            accounts,
            portfolio,
            toInvest,
            version: STORAGE.VERSION,
            lastSaved: new Date().toISOString(),
        };
        
        const jsonData = JSON.stringify(data);
        localStorage.setItem(STORAGE.KEY, jsonData);
    } catch (error) {
        console.error('Failed to save portfolio data to localStorage:', error);
        // Handle quota exceeded or other localStorage errors
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please clear some browser data or export your portfolio data as backup.');
        }
    }
}

export function loadPortfolioData(): PortfolioData | null {
    try {
        const stored = localStorage.getItem(STORAGE.KEY);
        if (!stored) {
            return null;
        }
        
        const data = JSON.parse(stored) as PortfolioData;
        
        // Validate data structure
        if (!isValidPortfolioData(data)) {
            console.warn('Invalid portfolio data found in localStorage, using defaults');
            return null;
        }
        
        return data;
    } catch {
        console.error('Failed to load portfolio data from localStorage');
        return null;
    }
}

export function getDefaultPortfolioData(): PortfolioData {
    return {
        accounts: defaultAccounts(),
        portfolio: defaultAssetClasses(),
        toInvest: 0,
        version: STORAGE.VERSION,
        lastSaved: new Date().toISOString(),
    };
}

export function exportPortfolioData(accounts: Account[], portfolio: AssetClass[], toInvest: number): void {
    const data: PortfolioData = {
        accounts,
        portfolio,
        toInvest,
        version: STORAGE.VERSION,
        lastSaved: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `rebalancer-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
}

export function importPortfolioData(file: File): Promise<PortfolioData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content) as PortfolioData;
                
                if (!isValidPortfolioData(data)) {
                    reject(new Error('Invalid portfolio data format'));
                    return;
                }
                
                resolve(data);
            } catch {
                reject(new Error('Failed to parse JSON file'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

export function clearPortfolioData(): void {
    try {
        localStorage.removeItem(STORAGE.KEY);
    } catch {
        console.error('Failed to clear portfolio data');
    }
}

function isValidPortfolioData(data: unknown): data is PortfolioData {
    if (!data || typeof data !== 'object') {
        return false;
    }
    
    const obj = data as Record<string, unknown>;
    
    // Check required fields
    if (!Array.isArray(obj.accounts) || !Array.isArray(obj.portfolio)) {
        return false;
    }
    
    if (typeof obj.toInvest !== 'number' || typeof obj.version !== 'string') {
        return false;
    }
    
    // Validate accounts structure
    for (const account of obj.accounts) {
        if (!account || typeof account !== 'object') return false;
        const acc = account as Record<string, unknown>;
        if (!acc.name || !acc.key || typeof acc.name !== 'string' || typeof acc.key !== 'string') {
            return false;
        }
    }
    
    // Validate portfolio structure
    for (const assetClass of obj.portfolio) {
        if (!assetClass || typeof assetClass !== 'object') return false;
        const ac = assetClass as Record<string, unknown>;
        if (!ac.name || !ac.key || typeof ac.allocation !== 'number' || !Array.isArray(ac.funds)) {
            return false;
        }
        
        for (const fund of ac.funds) {
            if (!fund || typeof fund !== 'object') return false;
            const f = fund as Record<string, unknown>;
            if (!f.ticker || !f.key || !f.values || typeof f.values !== 'object') {
                return false;
            }
        }
    }
    
    return true;
}