import { randomId } from '@mantine/hooks';
import { Account, AssetClass } from './types';

export function defaultAccounts(): Account[] {
    return [
        { name: '401k', key: randomId() },
        { name: 'Roth IRA', key: randomId() },
        { name: 'Vanguard Brokerage', key: randomId() },
    ];
}

export function defaultAssetClasses(): AssetClass[] {
    return [
        {
            name: 'US Total Stock Market',
            allocation: 60,
            funds: [
                { ticker: 'VTI', values: {}, key: randomId() }, 
                { ticker: 'IVV', values: {}, key: randomId() }
            ],
            key: randomId(),
        },
        {
            name: 'International Total Stock Market',
            allocation: 30,
            funds: [{ ticker: 'VXUS', values: {}, key: randomId() }],
            key: randomId(),
        },
        {
            name: 'US Total Bond Market',
            allocation: 10,
            funds: [{ ticker: 'BND', values: {}, key: randomId() }],
            key: randomId(),
        },
    ];
}