import { NumberInput, NumberInputProps } from "@mantine/core";
import type { NumberFormatValues } from "react-number-format";
import { useCallback } from "react";
import { FORMATTING, UI } from "../../constants";

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
    (values: NumberFormatValues): void => {
      if (!onValueChange) return;
      let finalValue = values.floatValue ?? 0;

      // Apply constraints based on field type
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
      min={allowNegative ? undefined : 0}
      allowDecimal={false}
      thousandSeparator={thousandSeparator}
      leftSection={finalLeftSection}
      onValueChange={handleValueChange}
      size={size}
      {...props}
    />
  );
}
