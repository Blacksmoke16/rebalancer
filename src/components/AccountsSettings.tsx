import { ActionIcon, Button, Group, Paper, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { IconTrash } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Account } from '../types';

interface AccountsSettingsProps {
    accounts: Account[];
    onAccountsChange: (accounts: Account[]) => void;
}

export function AccountsSettings({ accounts, onAccountsChange }: AccountsSettingsProps) {
    const accountForm = useForm({
        mode: 'uncontrolled',
        initialValues: {
            accounts,
        },
        validateInputOnChange: true,
        validate: {
            accounts: {
                name: (value: string) => value.trim().length === 0 ? 'Required' : null,
            },
        },
    });

    // Update form when accounts prop changes (e.g., after import)
    useEffect(() => {
        accountForm.setValues({ accounts });
        accountForm.setInitialValues({ accounts });
    }, [accounts]); // Remove accountForm from deps to prevent infinite loop

    return (
        <Paper shadow="xl" withBorder p="xl" style={{ minWidth: '300px' }}>
            <Title order={3}>Accounts</Title>
            <form
                onSubmit={accountForm.onSubmit((values) => {
                    onAccountsChange(values.accounts);
                    accountForm.setInitialValues({ accounts: values.accounts });
                    accountForm.reset();
                })}>
                {accountForm.getValues().accounts.map((a, idx) => (
                    <Group key={a.key} mt="md">
                        <TextInput
                            placeholder="Account name"
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
    );
}