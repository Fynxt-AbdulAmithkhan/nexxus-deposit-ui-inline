import { Box, chakra, Flex, Text } from '@chakra-ui/react';
import { countryFlag } from '../../deposit/countries';

/** Labelled form row used throughout the rule editors. */
export function Field({
    label,
    hint,
    children,
}: {
    label: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <Box>
            <Text fontSize='xs' fontWeight='medium' color='fg.muted' mb={1}>
                {label}
            </Text>
            {children}
            {hint && (
                <Text fontSize='2xs' color='fg.subtle' mt={1}>
                    {hint}
                </Text>
            )}
        </Box>
    );
}

/** Multi-select rendered as toggleable chips. */
export function ChipGroup<T extends string>({
    options,
    selected,
    onToggle,
    labelFor,
}: {
    options: readonly T[];
    selected: readonly T[];
    onToggle: (value: T) => void;
    labelFor?: (value: T) => string;
}) {
    return (
        <Flex wrap='wrap' gap={1.5}>
            {options.map((option) => {
                const isOn = selected.includes(option);
                return (
                    <chakra.button
                        key={option}
                        type='button'
                        onClick={() => onToggle(option)}
                        px={2.5}
                        py={1}
                        fontSize='xs'
                        borderRadius='full'
                        borderWidth='1px'
                        cursor='pointer'
                        borderColor={isOn ? 'brand.solid' : 'border'}
                        bg={isOn ? 'brand.subtle' : 'bg'}
                        color={isOn ? 'brand.fg' : 'fg.muted'}
                        fontWeight={isOn ? 'semibold' : 'normal'}
                    >
                        {labelFor ? labelFor(option) : option}
                    </chakra.button>
                );
            })}
        </Flex>
    );
}

export const Input = chakra('input', {
    base: {
        w: 'full',
        h: '32px',
        px: 2,
        fontSize: 'sm',
        bg: 'bg',
        borderWidth: '1px',
        borderColor: 'border',
        borderRadius: 'md',
        outline: 'none',
        _focus: { borderColor: 'brand.solid' },
    },
});

export const Select = chakra('select', {
    base: {
        w: 'full',
        h: '32px',
        px: 2,
        fontSize: 'sm',
        bg: 'bg',
        borderWidth: '1px',
        borderColor: 'border',
        borderRadius: 'md',
        outline: 'none',
        _focus: { borderColor: 'brand.solid' },
    },
});

/**
 * Countries as a comma-separated list of alpha-2 codes. Free text rather than a picker so
 * a scenario can be typed quickly, and so the exact codes being matched stay visible —
 * an empty list means the rule is unrestricted.
 */
export function CountriesInput({
    value,
    onChange,
}: {
    value: string[];
    onChange: (next: string[]) => void;
}) {
    return (
        <Box>
            <Input
                value={value.join(', ')}
                placeholder='e.g. US, EU — empty means all countries'
                onChange={(e) => {
                    const next = e.target.value
                        .split(',')
                        .map((code) => code.trim().toUpperCase())
                        .filter((code) => code.length > 0);
                    onChange(next);
                }}
            />
            {value.length > 0 && (
                <Flex wrap='wrap' gap={1} mt={1.5}>
                    {value.map((code) => (
                        <Text key={code} fontSize='2xs' color='fg.subtle'>
                            {countryFlag(code)} {code}
                        </Text>
                    ))}
                </Flex>
            )}
        </Box>
    );
}
