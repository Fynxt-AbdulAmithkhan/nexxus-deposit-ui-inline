import { Box, Button, HStack, Text } from '@chakra-ui/react';

export type ViewKey = 'deposit' | 'crm' | 'limits';

const ITEMS: { key: ViewKey; label: string; query: string; hint: string }[] = [
    { key: 'deposit', label: 'Deposit demo', query: '', hint: 'The checkout flow' },
    {
        key: 'crm',
        label: 'Limits (CRM embed)',
        query: '?debug=crm',
        hint: 'The table as the CRM mounts it',
    },
    {
        key: 'limits',
        label: 'Limits (payload)',
        query: '?debug=limits',
        hint: 'Raw pspActions, before vs after',
    },
];

type Props = {
    active: ViewKey;
};

/** Top-level switcher so the harnesses are reachable without typing query params. */
export function AppNav({ active }: Props) {
    return (
        <Box bg='gray.50' borderBottomWidth='1px' px={6} py={3}>
            <HStack gap={2} wrap='wrap'>
                <Text color='gray.500' fontSize='xs' fontWeight='semibold' mr={2}>
                    NEXXUS DEV
                </Text>
                {ITEMS.map((item) => (
                    <Button
                        key={item.key}
                        onClick={() => {
                            window.location.href = `${window.location.pathname}${item.query}`;
                        }}
                        size='xs'
                        title={item.hint}
                        variant={active === item.key ? 'solid' : 'ghost'}
                    >
                        {item.label}
                    </Button>
                ))}
            </HStack>
        </Box>
    );
}
