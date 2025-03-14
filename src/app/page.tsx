'use client';

import { FocusEvent, StrictMode, useState } from 'react';

enum Mode {
    NoSell,
    AllowSell
}

export default function Home() {
    const [account, setAccount] = useState<string>('');
    const [accounts, setAccounts] = useState<string[]>([
        '401k',
        'Roth IRA',
        'HSA',
        'Taxable',
    ]);

    const [category, setCategory] = useState<string>('');
    const [categories, setCategories] = useState([
        { name: 'US Stocks', funds: [{ name: 'VTSAX / VTI' }], allotment: 0.5 },
        { name: 'US Small Value', funds: [{ name: 'AVUV' }], allotment: 0.2 },
        { name: 'International Stocks', funds: [{ name: 'VTIAX / VXUS' }], allotment: 0.2 },
        { name: 'International Small Value', funds: [{ name: 'AVDV' }], allotment: 0.1 },
    ]);

    const [totals, setTotals] = useState<number[][]>(() => {
        return categories.map((cat) => {
            return accounts.map((acct) => 0);
        });
    });

    const updateAccount = (event: FocusEvent<HTMLInputElement>, idx: number) => {
        setAccounts(
            accounts.map((a, i) => i === idx ? event.target.value : a),
        );
    };

    const updateTotals = (event: FocusEvent<HTMLInputElement>, category_index: number, account_index: number): void => {
        const newTotals = totals.map((a) => a.slice());
        newTotals[category_index][account_index] = Number(event.target.value);
        setTotals(newTotals);
    };

    return (
        <StrictMode>
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Funds</th>
                        {accounts.map((name, idx) => <th key={name}>
                            <input onBlur={(event) => updateAccount(event, idx)} defaultValue={name}/>
                        </th>)}
                        <th>Totals</th>
                    </tr>
                    </thead>
                    {
                        categories.map((cat, c_idx) => {
                            return (
                                <tbody key={`category-group-${c_idx}`}>
                                <tr key={`category-${c_idx}`}>
                                    <th>{cat.name}</th>
                                </tr>
                                {
                                    cat.funds.map((fund, f_idx) => {
                                        return (
                                            <tr key={`category-${c_idx}-${f_idx}`}>
                                                <td>{fund.name}</td>
                                                {accounts.map((name, a_idx) => <td key={`account-${c_idx}-${a_idx}`}>
                                                    <input onBlur={(event) => updateTotals(event, c_idx, a_idx)} defaultValue={totals[c_idx][a_idx]}/>
                                                </td>)}
                                                <td key={`category-totals-${c_idx}`}>Category Total: {totals[c_idx].reduce((acc, v) => acc + v, 0)}</td>
                                            </tr>
                                        );
                                    })
                                }
                                </tbody>
                            );
                        })
                    }
                    <tbody>
                    <tr>
                        <th>Totals:</th>
                        {categories.map((_cat, idx) => {
                            return <td key={`acct-totals-${idx}`}>Account Total: {totals.reduce((acc, v) => acc + v[idx], 0)}</td>;
                        })}
                    </tr>
                    </tbody>
                </table>

                <hr/>

                <table>
                    <thead>
                    <tr>
                        <th>Category</th>
                        <th>Allotment</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        categories.map((cat, c_idx) => {
                            return (
                                <tr key={`category-config-${c_idx}`}>
                                    <td>{cat.name}</td>
                                    <td>{cat.allotment}</td>
                                </tr>
                            );
                        })
                    }
                    </tbody>
                </table>
            </div>
        </StrictMode>
    );
}
