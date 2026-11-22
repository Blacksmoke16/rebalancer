import { ActionIcon, NumberInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { FORMATTING } from "../../constants";

// Percentage input with validation
interface PercentageInputProps {
  value?: number;
  onChange?: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  error?: React.ReactNode;
  "data-testid"?: string;
}

export function PercentageInput({
  value,
  onChange,
  label = "Target %",
  placeholder = "60",
  error,
  "data-testid": dataTestId,
}: PercentageInputProps) {
  return (
    <NumberInput
      label={label}
      placeholder={placeholder}
      min={0}
      max={100}
      suffix={FORMATTING.PERCENT_SUFFIX}
      value={value}
      onChange={onChange}
      error={error}
      data-testid={dataTestId}
    />
  );
}

// Delete button for list items
interface DeleteButtonProps {
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
  className?: string;
  "aria-label"?: string;
}

export function DeleteButton({
  onClick,
  size = "lg",
  style,
  className,
  "aria-label": ariaLabel = "Delete",
}: DeleteButtonProps) {
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
}
