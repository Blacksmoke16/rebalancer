import { NumberInput, NumberInputProps } from '@mantine/core';
import { FORMATTING, UI } from '../../constants';

interface NumberFieldProps extends Omit<NumberInputProps, 'onBlur' | 'onValueChange'> {
    onValueChange?: (value: number) => void;
    prefix?: string;
    isCurrency?: boolean;
}

export function NumberField({ 
    onValueChange, 
    prefix, 
    isCurrency = false,
    size = UI.INPUT_SIZE,
    thousandSeparator = FORMATTING.THOUSAND_SEPARATOR,
    leftSection,
    ...props 
}: NumberFieldProps) {
    const handleValueChange = (value: string | number) => {
        if (onValueChange) {
            const numericValue = typeof value === 'string' 
                ? parseInt(value.replace(/,/g, '')) || 0 
                : value || 0;
            onValueChange(numericValue);
        }
    };

    const finalLeftSection = isCurrency ? FORMATTING.DOLLAR_PREFIX : (prefix ?? leftSection);

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