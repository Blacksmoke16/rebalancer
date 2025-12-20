import {
  Button,
  Group,
  Paper,
  Title,
  Text,
  Stack,
  ActionIcon,
} from "@mantine/core";
import { memo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { Account } from "../types";
import { useAccountForm } from "../hooks/useAccountForm";
import { AccountNameInput, DeleteButton, FieldGroup } from "./ui/FormFields";
import classes from "./AccountsSettings.module.css";

interface SortableAccountItemProps {
  account: Account;
  index: number;
  inputProps: ReturnType<typeof Object>;
  onRemove: () => void;
}

function SortableAccountItem({
  account,
  index,
  inputProps,
  onRemove,
}: SortableAccountItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: account.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={classes.accountItem}>
      <FieldGroup align="flex-end">
        <ActionIcon
          {...attributes}
          {...listeners}
          variant="subtle"
          color="gray"
          className={classes.dragHandle}
          aria-label={`Drag to reorder ${account.name || "account"}`}
        >
          <IconGripVertical size={18} />
        </ActionIcon>
        <AccountNameInput
          {...inputProps}
          placeholder={`Account ${index + 1} name (e.g., 401k, Roth IRA)`}
        />
        <DeleteButton
          onClick={onRemove}
          aria-label={`Delete account ${account.name || "account"}`}
        />
      </FieldGroup>
    </div>
  );
}

interface AccountsSettingsProps {
  accounts: Account[];
  onAccountsChange: (accounts: Account[]) => void;
}

export const AccountsSettings = memo<AccountsSettingsProps>(
  function AccountsSettings({ accounts, onAccountsChange }) {
    const {
      form,
      handleSubmit,
      addAccount,
      removeAccount,
      reorderAccounts,
      isLoading,
    } = useAccountForm({ accounts, onAccountsChange });

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      }),
    );

    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = form.values.accounts.findIndex(
          (a) => a.key === active.id,
        );
        const newIndex = form.values.accounts.findIndex(
          (a) => a.key === over.id,
        );
        reorderAccounts(oldIndex, newIndex);
      }
    }

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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.values.accounts.map((a) => a.key)}
                  strategy={verticalListSortingStrategy}
                >
                  {form.values.accounts.map((account, idx) => (
                    <SortableAccountItem
                      key={account.key}
                      account={account}
                      index={idx}
                      inputProps={form.getInputProps(`accounts.${idx}.name`)}
                      onRemove={() => {
                        removeAccount(idx);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

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
