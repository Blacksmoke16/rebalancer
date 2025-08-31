import { Button, Group, Paper, Title } from '@mantine/core';
import { memo } from 'react';
import { Account } from '../types';
import { useAccountForm } from '../hooks/useAccountForm';
import { AccountNameInput, DeleteButton, FieldGroup } from './ui/FormFields';
import classes from './AccountsSettings.module.css';

interface AccountsSettingsProps {
    accounts: Account[];
    onAccountsChange: (accounts: Account[]) => void;
}

export const AccountsSettings = memo<AccountsSettingsProps>(function AccountsSettings({ 
    accounts, 
    onAccountsChange 
}) {
    const {
        form,
        handleSubmit,
        addAccount,
        removeAccount,
        isLoading,
    } = useAccountForm({ accounts, onAccountsChange });

    return (
        <Paper shadow="xl" withBorder p="xl" className={classes.container}>
            <Title order={3}>Accounts</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                {form.getValues().accounts.map((account, idx) => (
                    <FieldGroup key={account.key} className={classes.accountItem}>
                        <AccountNameInput
                            {...form.getInputProps(`accounts.${idx}.name`)}
                        />
                        <DeleteButton 
                            onClick={() => removeAccount(idx)}
                            aria-label={`Delete account ${account.name || 'account'}`}
                        />
                    </FieldGroup>
                ))}
                <Group className={classes.actionButtons} justify="space-evenly">
                    <Button 
                        onClick={addAccount}
                        disabled={isLoading}
                    >
                        Add Account
                    </Button>
                    <Button 
                        disabled={!form.isValid() || !form.isDirty() || isLoading} 
                        loading={isLoading}
                        type="submit"
                    >
                        Save
                    </Button>
                </Group>
            </form>
        </Paper>
    );
});
