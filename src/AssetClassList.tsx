import { ActionIcon, Box, Button, Center, Group, NumberInput, Paper, Text, TextInput, Title } from '@mantine/core';
import { formRootRule, isNotEmpty, useForm } from '@mantine/form';
import { IconTrash } from '@tabler/icons-react';
import { Portfolio } from './App.tsx';

interface FormType {
    accounts: Portfolio['accounts'];
}

function AssetClassList() {
    const form = useForm<FormType>({
        mode: 'controlled',
        initialValues: {
            accounts: [
                {
                    name: 'Total US Stocks',
                    allocation: 60,
                },
                {
                    name: 'Total International Stocks',
                    allocation: 30,
                },
                {
                    name: 'Total US Bonds',
                    allocation: 10,
                },
            ],
        },
        validateInputOnChange: true,
        validate: {
            accounts: {
                [formRootRule]: isNotEmpty('At least one asset is required'),
                name: isNotEmpty('Each asset must have a name'),
            },
        },
    });

    const allocationTotal = form.values.accounts.reduce((acc, account) => acc + account.allocation, 0);
    const isOverAllocated = allocationTotal > 100;

    const fields = form.getValues().accounts.map((_account, idx) => (
        <Group key={`account.${idx}`} align="flex-start" mt="sm" mb="md">
            <TextInput
                placeholder="Asset name"
                {...form.getInputProps(`accounts.${idx}.name`)}
            />
            <NumberInput
                min={0}
                max={100}
                allowDecimal={false}
                suffix="%"
                {...form.getInputProps(`accounts.${idx}.allocation`)}
            />
            <ActionIcon color="red" onClick={() => { form.removeListItem('accounts', idx); }}>
                <IconTrash size={16}/>
            </ActionIcon>
        </Group>
    ));

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
            <Box display="flex" ta="center" mt={4}>
                <Paper shadow="xl" withBorder p="xl">
                    <Title order={3}>Desired Allocation</Title>

                    {fields}

                    <Center>
                        <Text c={isOverAllocated ? 'red' : 'black'}>
                            Total Allocation: {allocationTotal}
                        </Text>
                    </Center>
                    <Group justify="center" mt="md">
                        <Button
                            onClick={() => {
                                form.insertListItem('accounts', { name: '', allocation: 0 });
                                form.clearFieldError('accounts');
                            }}
                        >
                            Add Asset
                        </Button>
                        <Button disabled={!form.isValid()} type="submit">Save</Button>
                    </Group>
                </Paper>
            </Box>
        </form>
    );
}

export default AssetClassList;
