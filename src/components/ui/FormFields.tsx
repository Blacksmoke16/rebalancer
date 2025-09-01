import { ActionIcon, Group, NumberInput, TextInputProps } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { memo, useCallback } from "react";
import { FORMATTING } from "../../constants";
import { validateAndTransform } from "../../utils/validation";
import { ValidatedInput } from "./ValidatedInput";
import { createPercentage, Percentage } from "../../types/branded";
import commonClasses from "../../styles/common.module.css";

// Reusable ticker input with validation
interface TickerInputProps extends Omit<TextInputProps, "onChange"> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TickerInput = memo<TickerInputProps>(function TickerInput({
  value = "",
  onChange,
  ...props
}) {
  return (
    <ValidatedInput
      placeholder="VTI"
      className={commonClasses.uppercaseInput}
      value={value}
      onChange={onChange}
      validationType="ticker"
      {...props}
    />
  );
});

// Percentage input with validation
interface PercentageInputProps {
  value: Percentage;
  onChange: (value: Percentage) => void;
  label?: string;
  placeholder?: string;
}

export const PercentageInput = memo<PercentageInputProps>(
  function PercentageInput({
    value,
    onChange,
    label = "Target %",
    placeholder = "60",
  }) {
    const handleChange = useCallback(
      (inputValue: string | number) => {
        const numValue =
          typeof inputValue === "string"
            ? parseFloat(inputValue) || 0
            : inputValue;
        const result = validateAndTransform.percentage(numValue);
        onChange(createPercentage(result.value ?? 0));
      },
      [onChange],
    );

    return (
      <NumberInput
        label={label}
        placeholder={placeholder}
        min={0}
        max={100}
        suffix={FORMATTING.PERCENT_SUFFIX}
        value={value}
        onChange={handleChange}
      />
    );
  },
);

// Asset class name input
interface AssetClassNameInputProps extends Omit<TextInputProps, "onChange"> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AssetClassNameInput = memo<AssetClassNameInputProps>(
  function AssetClassNameInput({ value = "", onChange, ...props }) {
    return (
      <ValidatedInput
        placeholder="Asset class name"
        label="Name"
        value={value}
        onChange={onChange}
        validationType="name"
        {...props}
      />
    );
  },
);

// Account name input
interface AccountNameInputProps extends Omit<TextInputProps, "onChange"> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AccountNameInput = memo<AccountNameInputProps>(
  function AccountNameInput({ value = "", onChange, ...props }) {
    return (
      <ValidatedInput
        placeholder="Account name"
        label="Name"
        value={value}
        onChange={onChange}
        validationType="name"
        {...props}
      />
    );
  },
);

// Delete button for list items
interface DeleteButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  className?: string;
  "aria-label"?: string;
}

export const DeleteButton = memo<DeleteButtonProps>(function DeleteButton({
  onClick,
  size = "lg",
  style,
  className,
  "aria-label": ariaLabel = "Delete",
}) {
  return (
    <ActionIcon
      color="red"
      size={size}
      style={style}
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <IconTrash size={size === "lg" ? 16 : 14} />
    </ActionIcon>
  );
});

// Field group wrapper for consistent spacing
interface FieldGroupProps {
  children: React.ReactNode;
  align?: "flex-start" | "flex-end" | "center";
  className?: string;
  visibleFrom?: "xs" | "sm" | "md" | "lg" | "xl";
  hiddenFrom?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const FieldGroup = memo<FieldGroupProps>(function FieldGroup({
  children,
  align = "flex-start",
  className,
  visibleFrom,
  hiddenFrom,
}) {
  return (
    <Group
      align={align}
      className={className}
      visibleFrom={visibleFrom}
      hiddenFrom={hiddenFrom}
    >
      {children}
    </Group>
  );
});
