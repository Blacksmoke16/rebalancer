import { ActionIcon, Box, Button, Center, Group, NumberFormatter, NumberInput, Paper, ScrollArea, Stack, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, TextInput, Title } from '@mantine/core';
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';
import { randomId, useListState } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { Fragment, useState } from 'react';

interface Account {
    name: string;
    key: string;
}

/* Key representing name of an account and value being the value of the fund in that account */
type FundValues = Record<string, number>;

interface Fund {
    ticker: string;
    values: FundValues;
}

export interface AssetClass {
    name: string;
    allocation: number;
    funds: Fund[];
}

function defaultAccounts(): Account[] {
    return [
        { name: '401k', key: randomId() },
        { name: 'Roth IRA', key: randomId() },
        { name: 'Vanguard Brokerage', key: randomId() },
    ];
}

function defaultAssetClasses(): AssetClass[] {
    return [
        {
            name: 'US Total Stock Market',
            allocation: 60,
            funds: [{ ticker: 'VTI', values: {} }, { ticker: 'IVV', values: {} }],
        },
        {
            name: 'International Total Stock Market',
            allocation: 30,
            funds: [{ ticker: 'VXUS', values: {} }],
        },
        {
            name: 'US Total Bond Market',
            allocation: 10,
            funds: [{ ticker: 'BND', values: {} }],
        },
    ];
}

//const LOCAL_STORAGE_KEY = 'portfolio';
//const form = useForm<Portfolio>({
//    mode: 'uncontrolled',
//    initialValues: {
//        accounts: defaultAccounts(),
//        asset_classes: defaultAssetClasses(),
//    },
//    onValuesChange: (values) => {
//        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(values));
//    },
//});

//useEffect(() => {
//    const cachedValue = window.localStorage.getItem(LOCAL_STORAGE_KEY);
//
//    if (cachedValue) {
//        try {
//            form.setValues(JSON.parse(cachedValue) as Portfolio);
//        } catch {
//            console.error(`Failed to parse stored value`);
//        }
//    }
//}, [form]);

export default function App() {
    const [accounts, accountList] = useListState<Account>(defaultAccounts());
    const [portfolio, setPortfolio] = useState<AssetClass[]>(defaultAssetClasses);

    // TODO: Make this bound to an input
    const toInvest = 100;

    const currentPercentage = (assetClass: AssetClass) => (currentForAssetClass(assetClass) / totalDollars()) || 0;
    const targetDollars = (assetClass: AssetClass) => (totalDollars() + toInvest) * (assetClass.allocation / 100);
    const amountToBuy = (assetClass: AssetClass): number => {
        if (toInvest <= 0) {
            return 0;
        }

        const deltaDollars = targetDollars(assetClass) - currentForAssetClass(assetClass);

        const positiveDeltaDollars = portfolio.reduce((acc, ac) => {
            const delta = targetDollars(ac) - currentForAssetClass(ac);

            if (0 >= delta) {
                return acc;
            }

            return acc + delta;
        }, 0);

        return Math.max(
            0,
            toInvest * (deltaDollars / positiveDeltaDollars),
        );
    };

    const accountForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            accounts,
        },
        validateInputOnChange: true,
        validate: {
            accounts: {
                [formRootRule]: isNotEmpty('Must have at least one account'),
                name: isNotEmpty('Required'),
            },
        },
    });

    function updateAssetAccountValue(assetClassName: string, fundTicker: string, accountName: string, value: number): void {
        const port = [...portfolio];
        const assetClass = port.find((p) => {
            return p.name === assetClassName;
        });

        const fund = assetClass?.funds.find((f) => {
            return f.ticker === fundTicker;
        });

        if (!assetClass || !fund) {
            console.error('Failed to update account value');
            return;
        }

        fund.values[accountName] = value;

        setPortfolio(port);
    }

    function totalForAccount(accountName: string): number {
        return portfolio.reduce((assetAcc, p) => {
            return assetAcc + p.funds.reduce((fundAcc, f) => {
                return fundAcc + (f.values[accountName] ?? 0);
            }, 0);
        }, 0);
    }

    function currentForAssetClass(assetClass: AssetClass): number {
        return portfolio.reduce((acc, ac) => {
            if (assetClass.name !== ac.name) {
                return acc;
            }

            return acc + ac.funds.reduce((fundAcc, f) => {
                return fundAcc + (Object.values(f.values).reduce((valueAcc, v) => valueAcc + v, 0) || 0);
            }, 0);
        }, 0);
    }

    function totalForAssetClassAccount(assetClassName: string, accountName: string): number {
        return portfolio.reduce((acc, assetClass) => {
            if (assetClassName !== assetClass.name) {
                return acc;
            }

            return acc + assetClass.funds.reduce((fundAcc, f) => {
                return fundAcc + (f.values[accountName] ?? 0);
            }, 0);
        }, 0);
    }

    function totalDollars(): number {
        return portfolio.reduce((acc, a) => {
            return acc + currentForAssetClass(a);
        }, 0);
    }

    return (
        <Box display="flex">
            <Stack>
                <Group align="stretch">
                    <Paper shadow="xl" withBorder p="xl">
                        <Title order={3}>Accounts</Title>
                        <form
                            onSubmit={accountForm.onSubmit((values) => {
                                accountList.setState(values.accounts);
                                accountForm.setInitialValues({ accounts: values.accounts });
                                accountForm.reset();
                            })}>
                            {accountForm.getValues().accounts.map((a, idx) => (
                                <Group key={a.key} mt="md">
                                    <TextInput
                                        placeholder="Asset name"
                                        {...accountForm.getInputProps(`accounts.${idx}.name`)}
                                    />
                                    <ActionIcon color="red" onClick={() => { accountForm.removeListItem('accounts', idx); }}>
                                        <IconTrash size={16}/>
                                    </ActionIcon>
                                </Group>
                            ))}
                            <Group mt="md" justify="space-evenly">
                                <Button
                                    onClick={() => {
                                        accountForm.insertListItem('accounts', { name: '', key: randomId() });
                                        accountForm.clearFieldError('accounts');
                                    }}
                                >
                                    Add Account
                                </Button>
                                <Button disabled={!accountForm.isValid() || !accountForm.isDirty()} type="submit">
                                    Save
                                </Button>
                            </Group>

                        </form>
                    </Paper>
                    <ScrollArea>
                        <Paper p="xl" withBorder>
                            <Table withColumnBorders withTableBorder>
                                <TableThead>
                                    <TableTr>
                                        <TableTh>Asset Class</TableTh>
                                        <TableTh>Ticker</TableTh>
                                        {accounts.map((account) => (
                                            <TableTh key={account.key}>{account.name}</TableTh>
                                        ))}
                                        <TableTh>Asset Class Totals</TableTh>
                                    </TableTr>
                                </TableThead>
                                <TableTbody>
                                    {portfolio.map((assetClass) => (
                                        <Fragment key={assetClass.name}>
                                            {assetClass.funds.map((fund, fundIdx) => {
                                                return (
                                                    <Fragment key={fund.ticker}>
                                                        {
                                                            fundIdx === 0 && (
                                                                <>
                                                                    <TableTr>
                                                                        <TableTd/>
                                                                    </TableTr>
                                                                    <TableTr>
                                                                        <TableTd>
                                                                            {assetClass.name}
                                                                        </TableTd>
                                                                        <TableTd/>
                                                                        {accounts.map((account) => (
                                                                            <TableTd key={`${assetClass.name}-${account.key}-total`}>
                                                                                <Center>
                                                                                    <NumberFormatter prefix="$" value={totalForAssetClassAccount(assetClass.name, account.name)}/>
                                                                                </Center>
                                                                            </TableTd>
                                                                        ))}
                                                                        <TableTd>
                                                                            <Group justify="flex-end">
                                                                                <NumberFormatter prefix="$" value={currentForAssetClass(assetClass)}/>
                                                                            </Group>
                                                                        </TableTd>
                                                                    </TableTr>
                                                                </>
                                                            )
                                                        }
                                                        <TableTr>
                                                            {fundIdx === 0 && (
                                                                <TableTd rowSpan={assetClass.funds.length}/>
                                                            )}
                                                            <TableTd>{fund.ticker}</TableTd>
                                                            {accounts.map((account) => (
                                                                <TableTd key={account.key}>
                                                                    <NumberInput
                                                                        min={0}
                                                                        allowDecimal={false}
                                                                        leftSection="$"
                                                                        value={fund.values[account.name] || 0}
                                                                        onBlur={(e) => {
                                                                            updateAssetAccountValue(
                                                                                assetClass.name,
                                                                                fund.ticker,
                                                                                account.name,
                                                                                parseInt(e.target.value),
                                                                            );
                                                                        }}
                                                                        size="xs"
                                                                    />
                                                                </TableTd>
                                                            ))}
                                                            {fundIdx === 0 && (
                                                                <TableTd rowSpan={assetClass.funds.length}/>
                                                            )}
                                                        </TableTr>
                                                    </Fragment>
                                                );
                                            })}
                                        </Fragment>
                                    ))}
                                    <TableTr>
                                        <TableTd/>
                                    </TableTr>
                                    <TableTr>
                                        <TableTd colSpan={2}>
                                            Account Totals
                                        </TableTd>
                                        {accounts.map((account) => (
                                            <TableTd key={`${account.key}-total`}>
                                                <Center>
                                                    <NumberFormatter prefix="$" value={totalForAccount(account.name)}/>
                                                </Center>
                                            </TableTd>
                                        ))}
                                        <TableTd/>
                                    </TableTr>
                                </TableTbody>
                            </Table>
                        </Paper>
                    </ScrollArea>
                </Group>

                <Paper shadow="xl" withBorder p="xl">
                    <Table>
                        <TableThead>
                            <TableTr>
                                <TableTh>Asset Class</TableTh>
                                <TableTh>Target (%)</TableTh>
                                <TableTh>Current (%)</TableTh>
                                <TableTh>Target ($)</TableTh>
                                <TableTh>Current ($)</TableTh>
                                <TableTh>Delta (%)</TableTh>
                                <TableTh>Delta ($)</TableTh>
                                <TableTh>Projected (%)</TableTh>
                                <TableTh>Projected ($)</TableTh>
                                <TableTh>Amount to Buy</TableTh>
                            </TableTr>
                            {
                                portfolio.map((assetClass) => {
                                    return (
                                        <TableTr key={assetClass.name}>
                                            <TableTd>{assetClass.name}</TableTd>
                                            <TableTd>
                                                <NumberFormatter suffix="%" value={assetClass.allocation}/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter suffix="%" value={currentPercentage(assetClass) * 100} decimalScale={2}/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter prefix="$" thousandSeparator value={targetDollars(assetClass)}/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter prefix="$" thousandSeparator value={
                                                    currentForAssetClass(assetClass)
                                                }/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter suffix="%" value={(currentPercentage(assetClass) * 100) - assetClass.allocation} decimalScale={2}/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter prefix="$" thousandSeparator value={
                                                    targetDollars(assetClass) - currentForAssetClass(assetClass)
                                                }/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter prefix="$" thousandSeparator value={
                                                    currentForAssetClass(assetClass) + amountToBuy(assetClass)
                                                }/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter suffix="%" value={((currentForAssetClass(assetClass) + amountToBuy(assetClass)) / (totalDollars() + toInvest)) * 100} decimalScale={2}/>
                                            </TableTd>
                                            <TableTd>
                                                <NumberFormatter prefix="$" thousandSeparator value={amountToBuy(assetClass)}/>
                                            </TableTd>
                                        </TableTr>
                                    );
                                })
                            }
                        </TableThead>
                    </Table>
                </Paper>
            </Stack>
        </Box>
    );
}



