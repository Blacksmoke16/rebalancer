import { Group, NumberFormatter, Text } from "@mantine/core";
import { DELTA_COLORS, FORMATTING } from "../../constants";
import { AlignmentType, DeltaCellType } from "../../types";

interface CurrencyCellProps {
  value: number;
  align?: AlignmentType;
}

export function CurrencyCell({ value, align = "left" }: CurrencyCellProps) {
  const content = (
    <NumberFormatter
      prefix={FORMATTING.DOLLAR_PREFIX}
      thousandSeparator={FORMATTING.THOUSAND_SEPARATOR}
      value={value}
      decimalScale={FORMATTING.DECIMAL_PLACES.CURRENCY}
    />
  );

  if (align === "right") {
    return <Group justify="flex-end">{content}</Group>;
  }

  return content;
}

interface PercentageCellProps {
  value: number;
  align?: AlignmentType;
}

export function PercentageCell({ value, align = "left" }: PercentageCellProps) {
  const content = (
    <NumberFormatter
      suffix={FORMATTING.PERCENT_SUFFIX}
      value={value}
      decimalScale={FORMATTING.DECIMAL_PLACES.PERCENTAGE}
    />
  );

  if (align === "right") {
    return <Group justify="flex-end">{content}</Group>;
  }

  return content;
}

interface DeltaCellProps {
  value: number;
  type: DeltaCellType;
}

export function DeltaCell({ value, type }: DeltaCellProps) {
  const getDeltaColor = (val: number) => {
    if (val > 0) return DELTA_COLORS.POSITIVE;
    if (val < 0) return DELTA_COLORS.NEGATIVE;
    return DELTA_COLORS.NEUTRAL;
  };

  return (
    <Text c={getDeltaColor(value)}>
      <NumberFormatter
        prefix={type === "currency" ? FORMATTING.DOLLAR_PREFIX : undefined}
        suffix={type === "percentage" ? FORMATTING.PERCENT_SUFFIX : undefined}
        thousandSeparator={
          type === "currency" ? FORMATTING.THOUSAND_SEPARATOR : undefined
        }
        value={value}
        decimalScale={
          type === "currency"
            ? FORMATTING.DECIMAL_PLACES.CURRENCY
            : FORMATTING.DECIMAL_PLACES.PERCENTAGE
        }
        allowNegative
      />
    </Text>
  );
}
