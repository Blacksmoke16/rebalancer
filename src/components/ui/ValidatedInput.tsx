import { TextInput, TextInputProps } from '@mantine/core';
import { memo, useCallback } from 'react';
import { validateAndTransform } from '../../utils/validation';

type ValidationType = 'name' | 'ticker';

interface ValidatedInputProps extends Omit<TextInputProps, 'onChange'> {
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    validationType: ValidationType;
}

export const ValidatedInput = memo<ValidatedInputProps>(function ValidatedInput({
    value = '',
    onChange,
    validationType,
    ...props
}) {
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (onChange) {
            const result = validateAndTransform[validationType](event.target.value);
            const syntheticEvent = {
                ...event,
                target: {
                    // eslint-disable-next-line @typescript-eslint/no-misused-spread
                    ...event.target,
                    value: result.value ?? event.target.value
                }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
        }
    }, [onChange, validationType]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { defaultValue: _defaultValue, ...restProps } = props;

    return (
        <TextInput
            value={value}
            onChange={handleChange}
            {...restProps}
        />
    );
});