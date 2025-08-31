import { formRootRule, useForm } from '@mantine/form';
import { randomId } from '@mantine/hooks';
import { useCallback, useEffect, useState } from 'react';
import { Account } from '../types';
import { validateAndTransform } from '../utils/validation';

interface UseAccountFormProps {
    accounts: Account[];
    onAccountsChange: (accounts: Account[]) => void;
}

export function useAccountForm({ accounts, onAccountsChange }: UseAccountFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: { accounts },
        validateInputOnChange: true,
        validate: {
            accounts: {
                [formRootRule]: (accounts: Account[]) => 
                    accounts.length === 0 ? 'Must have at least one account' : null,
                name: (value: string) => {
                    const result = validateAndTransform.name(value);
                    return result.isValid ? null : result.error;
                },
            },
        },
    });

    // Update form when accounts prop changes (e.g., after import)
    useEffect(() => {
        form.setValues({ accounts });
        form.setInitialValues({ accounts });
    }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = useCallback((values: { accounts: Account[] }) => {
        setIsLoading(true);
        try {
            onAccountsChange(values.accounts);
            form.setInitialValues({ accounts: values.accounts });
            form.reset();
        } finally {
            setIsLoading(false);
        }
    }, [onAccountsChange, form]);

    const addAccount = useCallback(() => {
        form.insertListItem('accounts', { 
            name: '', 
            key: randomId() 
        });
        form.clearFieldError('accounts');
    }, [form]);

    const removeAccount = useCallback((index: number) => {
        form.removeListItem('accounts', index);
    }, [form]);

    return {
        form,
        handleSubmit,
        addAccount,
        removeAccount,
        isLoading,
    };
}