import { ActionIcon, Box, Button, Group, NumberInput, Paper, Stack, TextInput, Title } from '@mantine/core';
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { useEffect } from 'react';
import { AssetClass } from '../types';

interface AssetClassSettingsProps {
    portfolio: AssetClass[];
    onPortfolioChange: (portfolio: AssetClass[]) => void;
}

export function AssetClassSettings({ portfolio, onPortfolioChange }: AssetClassSettingsProps) {
    const validateAllocationSum = (portfolio: AssetClass[]) => {
        const totalAllocation = portfolio.reduce((sum, assetClass) => sum + (assetClass.allocation || 0), 0);
        return totalAllocation === 100 ? null : 'Total allocation must equal 100%';
    };

    const portfolioForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            portfolio,
        },
        validateInputOnChange: true,
        validate: {
            portfolio: {
                [formRootRule]: (value: AssetClass[]) => {
                    if (value.length === 0) return 'Must have at least one asset class';
                    return validateAllocationSum(value);
                },
                name: isNotEmpty('Asset class name is required'),
                allocation: isNotEmpty('Allocation is required'),
                funds: {
                    [formRootRule]: isNotEmpty('Must have at least one fund'),
                    ticker: isNotEmpty('Ticker is required'),
                },
            },
        },
    });

    // Update form when portfolio prop changes (e.g., after import)
    useEffect(() => {
        portfolioForm.setValues({ portfolio });
        portfolioForm.setInitialValues({ portfolio });
    }, [portfolio]); // Remove portfolioForm from deps to prevent infinite loop

    function addFundToAssetClass(assetClassIndex: number): void {
        portfolioForm.insertListItem(`portfolio.${assetClassIndex}.funds`, { ticker: '', values: {}, key: randomId() });
    }

    function removeFundFromAssetClass(assetClassIndex: number, fundIndex: number): void {
        portfolioForm.removeListItem(`portfolio.${assetClassIndex}.funds`, fundIndex);
    }

    function preserveFundValues(newPortfolio: AssetClass[]): AssetClass[] {
        return newPortfolio.map(newAssetClass => {
            const existingAssetClass = portfolio.find(existing => existing.name === newAssetClass.name);
            
            if (!existingAssetClass) {
                return newAssetClass;
            }

            const updatedFunds = newAssetClass.funds.map(newFund => {
                const existingFund = existingAssetClass.funds.find(existing => existing.ticker === newFund.ticker);
                
                if (existingFund) {
                    return {
                        ...newFund,
                        values: existingFund.values
                    };
                }
                
                return newFund;
            });

            return {
                ...newAssetClass,
                funds: updatedFunds
            };
        });
    }

    return (
        <Paper shadow="xl" withBorder p="xl" style={{ minWidth: '600px' }}>
            <Title order={3}>Asset Classes</Title>
            <form
                onSubmit={portfolioForm.onSubmit((values) => {
                    const portfolioWithPreservedValues = preserveFundValues(values.portfolio);
                    onPortfolioChange(portfolioWithPreservedValues);
                    portfolioForm.setInitialValues({ portfolio: portfolioWithPreservedValues });
                    portfolioForm.reset();
                })}>
                {portfolioForm.getValues().portfolio.map((assetClass, assetIdx) => (
                    <Paper key={assetClass.key} withBorder p="md" mt="md">
                        <Group align="flex-start">
                            <Stack style={{ flex: 1 }}>
                                <Group>
                                    <TextInput
                                        placeholder="Asset class name"
                                        label="Name"
                                        {...portfolioForm.getInputProps(`portfolio.${assetIdx}.name`)}
                                    />
                                    <NumberInput
                                        placeholder="60"
                                        label="Target %"
                                        min={0}
                                        max={100}
                                        suffix="%"
                                        {...portfolioForm.getInputProps(`portfolio.${assetIdx}.allocation`)}
                                    />
                                    <ActionIcon 
                                        color="red" 
                                        size="lg"
                                        style={{ marginTop: '25px' }}
                                        onClick={() => { 
                                            portfolioForm.removeListItem('portfolio', assetIdx); 
                                        }}
                                    >
                                        <IconTrash size={16}/>
                                    </ActionIcon>
                                </Group>
                                <Box>
                                    <Title order={5}>Funds</Title>
                                    {assetClass.funds.map((fund, fundIdx) => (
                                        <Group key={fund.key} mt="xs">
                                            <TextInput
                                                placeholder="VTI"
                                                {...portfolioForm.getInputProps(`portfolio.${assetIdx}.funds.${fundIdx}.ticker`)}
                                            />
                                            <ActionIcon 
                                                color="red" 
                                                onClick={() => { 
                                                    removeFundFromAssetClass(assetIdx, fundIdx); 
                                                }}
                                            >
                                                <IconTrash size={14}/>
                                            </ActionIcon>
                                        </Group>
                                    ))}
                                    <Button
                                        size="xs"
                                        mt="xs"
                                        onClick={() => { 
                                            addFundToAssetClass(assetIdx); 
                                        }}
                                    >
                                        Add Fund
                                    </Button>
                                </Box>
                            </Stack>
                        </Group>
                    </Paper>
                ))}
                <Group mt="md" justify="space-evenly">
                    <Button
                        onClick={() => {
                            portfolioForm.insertListItem('portfolio', {
                                name: '',
                                allocation: 0,
                                funds: [{ ticker: '', values: {}, key: randomId() }],
                                key: randomId()
                            });
                            portfolioForm.clearFieldError('portfolio');
                        }}
                    >
                        Add Asset Class
                    </Button>
                    <Button disabled={!portfolioForm.isValid() || !portfolioForm.isDirty()} type="submit">
                        Save
                    </Button>
                </Group>
                <Group mt="md" justify="center">
                    <Title order={6}>
                        Total Allocation: {portfolioForm.getValues().portfolio.reduce((sum, ac) => sum + (ac.allocation || 0), 0)}%
                        {portfolioForm.getValues().portfolio.reduce((sum, ac) => sum + (ac.allocation || 0), 0) !== 100 && 
                            <span style={{ color: 'red' }}> (Must equal 100%)</span>
                        }
                    </Title>
                </Group>
            </form>
        </Paper>
    );
}