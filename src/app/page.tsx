'use client';

import { number } from 'prop-types';
import { useState, FocusEvent } from 'react';

export default function Home() {
    const [account, setAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<string[]>([
        '401k',
        'Roth IRA',
        'HSA',
        'Taxable',
    ]);

    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState<string[]>([
        'US Stocks',
        'US Small Value',
        'International Stocks',
        'International Small Value',
    ]);

    const [totals, setTotals] = useState<{ [idx: number]: { [idx: number]: number } }>(() => {
        const totals: { [idx: number]: { [idx: number]: number } } = {};

        categories.forEach((_value, c_idx: number) => {
            const cat_totals: { [idx: number]: number } = {};

            accounts.forEach((_value, a_idx: number) => {
                cat_totals[a_idx] = 0;
            });

            totals[c_idx] = cat_totals;
        });

        return totals;
    });

    const updateAccount = (event: FocusEvent<HTMLInputElement>, idx: number) => {
        setAccounts(
            accounts.map((a, i) => i === idx ? event.target.value : a),
        );
    };

    const updateTotals = (event: FocusEvent<HTMLInputElement>, category_index: number, account_index: number): void => {
        const newTotals = Object.assign({}, totals);
        newTotals[category_index][account_index] = Number(event.target.value);
        setTotals(newTotals);
    };

    return (
        <div>
            <table>
                <thead>
                <tr>
                    <th>Category</th>
                    {accounts.map((name, idx) => <th key={name}>
                        <input onBlur={(event) => updateAccount(event, idx)} defaultValue={name}/>
                    </th>)}
                    <th>Totals</th>
                </tr>
                </thead>
                <tbody>
                {categories.map((name, c_idx) => {
                    return (
                        <tr key={c_idx}>
                            <td>{name}</td>
                            {accounts.map((name, a_idx) => <td key={`${c_idx}-${a_idx}`}>
                                <input onBlur={(event) => updateTotals(event, c_idx, a_idx)} defaultValue={totals[c_idx][a_idx]}/>
                            </td>)}
                            <td key={`category-totals-${c_idx}`}>Category Total: {Object.values(totals[c_idx]).reduce((acc, v) => acc + v, 0)}</td>
                        </tr>
                    );
                })}
                <tr>
                    <td>Totals</td>
                    {categories.map((name: string, idx) => {
                        return <td key={`acct-totals-${idx}`}>Account Total: {Object.values(totals).reduce((acc, v) => acc + v[idx], 0)}</td>
                    })}
                </tr>
                </tbody>
            </table>

            <hr/>

            <div>
                <input
                    value={category}
                    placeholder="Category..."
                    onChange={e => setCategory(e.target.value)}
                />
                <button
                    onClick={() => {
                        setCategories([...categories, category]);
                        setCategory('');
                    }}>Add Category
                </button>
            </div>
            <br/>
            <div>
                <input
                    value={account}
                    placeholder="Account..."
                    onChange={e => setAccount(e.target.value)}
                />
                <button
                    onClick={() => {
                        setAccounts([...accounts, account]);
                        setAccount('');
                    }}>Add Account
                </button>
            </div>
        </div>
    );
}
