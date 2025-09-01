import { Button, Group, Paper, Title, Text, Stack } from "@mantine/core";
import { memo } from "react";
import { Account } from "../types";
import { useAccountForm } from "../hooks/useAccountForm";
import { AccountNameInput, DeleteButton, FieldGroup } from "./ui/FormFields";
import classes from "./AccountsSettings.module.css";

interface AccountsSettingsProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

export const AccountsSettings = memo<AccountsSettingsProps>(
  function AccountsSettings({ accounts, onAccountsChange }) {
    const { form, handleSubmit, addAccount, removeAccount, isLoading } =
      useAccountForm({ accounts, onAccountsChange });

    return (
      <Paper shadow="sm" withBorder p="xl" className={classes.container}>
        <Stack gap="md">
          <div>
            <Title order={3}>Investment Accounts</Title>
            <Text size="sm" c="dimmed" mt="xs">
              Define the accounts where you hold your investments (e.g., 401k,
              IRA, Taxable)
            </Text>
          </div>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {form.values.accounts.map((account, idx) => (
                <FieldGroup
                  key={account.key}
                  align="flex-end"
                  className={classes.accountItem}
                >
                  <AccountNameInput
                    {...form.getInputProps(`accounts.${idx}.name`)}
                    placeholder={`Account ${idx + 1} name (e.g., 401k, Roth IRA)`}
                  />
                  <DeleteButton
                    onClick={() => {
                      removeAccount(idx);
                    }}
                    aria-label={`Delete account ${account.name || "account"}`}
                  />
                </FieldGroup>
              ))}

              <Group
                className={classes.actionButtons}
                justify="space-between"
                mt="lg"
              >
                <Button
                  variant="light"
                  onClick={addAccount}
                  disabled={isLoading}
                >
                  + Add Account
                </Button>
                <Button
                  disabled={!form.isValid() || !form.isDirty() || isLoading}
                  loading={isLoading}
                  type="submit"
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Paper>
    );
  },
);
