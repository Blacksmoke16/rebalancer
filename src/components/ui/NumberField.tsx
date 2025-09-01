import { NumberInput, NumberInputProps } from "@mantine/core";
import { useCallback } from "react";
import { FORMATTING, UI } from "../../constants";
import { validation } from "../../utils/validation";

interface NumberFieldProps
  extends Omit<NumberInputProps, "onBlur" | "onValueChange"> {
  onValueChange?: (value: number) => void;
  prefix?: string;
  isCurrency?: boolean;
  allowNegative?: boolean;
}

export function NumberField({
  onValueChange,
  prefix,
  isCurrency = false,
  allowNegative = false,
  size = UI.INPUT_SIZE,
  thousandSeparator = FORMATTING.THOUSAND_SEPARATOR,
  leftSection,
  ...props
}: NumberFieldProps) {
  const handleValueChange = useCallback(
    (value: string | number): void => {
      if (!onValueChange) return;

      const parsedValue =
        typeof value === "string" ? validation.parseAmount(value) : value || 0;

      // Apply constraints based on field type
      let finalValue = parsedValue;
      if (!allowNegative && finalValue < 0) {
        finalValue = 0;
      }

      onValueChange(finalValue);
    },
    [onValueChange, allowNegative],
  );

  const finalLeftSection = isCurrency
    ? FORMATTING.DOLLAR_PREFIX
    : (prefix ?? leftSection);

  return (
    <NumberInput
      min={0}
      allowDecimal={false}
      thousandSeparator={thousandSeparator}
      leftSection={finalLeftSection}
      onChange={handleValueChange}
      size={size}
      {...props}
    />
  );
}
