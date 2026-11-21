import { formRootRule, isNotEmpty, useForm } from "@mantine/form";
import { randomId } from "@mantine/hooks";
import { useCallback, useEffect } from "react";
import { Account } from "../types";
import { AccountId } from "../types/branded";
import { sanitizeName } from "../utils/validation";

interface UseAccountFormProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

export function useAccountForm({
  accounts,
  onAccountsChange,
}: UseAccountFormProps) {
  const form = useForm({
    mode: "controlled",
    initialValues: { accounts },
    validateInputOnChange: true,
    validate: {
      accounts: {
        [formRootRule]: (accounts: Account[]) =>
          accounts.length === 0 ? "Must have at least one account" : null,
        name: isNotEmpty("Name is required"),
      },
    },
    transformValues: (values) => ({
      accounts: values.accounts.map((account) => ({
        ...account,
        name: sanitizeName(account.name),
      })),
    }),
  });

  // Update form when accounts prop changes (e.g., after import)
  useEffect(() => {
    form.setValues({ accounts });
    form.setInitialValues({ accounts });
  }, [accounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = useCallback(
    (values: { accounts: Account[] }) => {
      onAccountsChange(values.accounts);
      form.setInitialValues({ accounts: values.accounts });
      form.reset();
    },
    [onAccountsChange, form],
  );

  const addAccount = useCallback(() => {
    form.insertListItem("accounts", {
      name: "",
      key: randomId() as AccountId,
    });
    form.clearFieldError("accounts");
  }, [form]);

  const removeAccount = useCallback(
    (index: number) => {
      form.removeListItem("accounts", index);
    },
    [form],
  );

  const reorderAccounts = useCallback(
    (from: number, to: number) => {
      form.reorderListItem("accounts", { from, to });
    },
    [form],
  );

  return {
    form,
    handleSubmit,
    addAccount,
    removeAccount,
    reorderAccounts,
  };
}
