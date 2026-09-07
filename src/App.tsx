import { Badge, Box, chakra, Flex, Text } from '@chakra-ui/react';
import { Settings2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { DepositPage } from './features/deposit/deposit-page';
import { DEMO } from './features/deposit/demo';
import { CrmPage } from './features/rules/crm-page';
import { useRulesState } from './features/rules/store';

type Tab = 'cp' | 'crm';

function TabButton({
    active,
    onClick,
    icon,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <chakra.button
            type='button'
            onClick={onClick}
            display='flex'
            alignItems='center'
            gap={1.5}
            px={3}
            py={2}
            fontSize='sm'
            fontWeight={active ? 'semibold' : 'medium'}
            cursor='pointer'
            color={active ? 'brand.fg' : 'fg.muted'}
            borderBottomWidth='2px'
            borderColor={active ? 'brand.solid' : 'transparent'}
            bg='transparent'
        >
            {icon}
            {children}
        </chakra.button>
    );
}

export default function App() {
    const [tab, setTab] = useState<Tab>('cp');
    const { mode } = useRulesState();

    return (
        <Box minH='100vh'>
            <Flex
                align='center'
                gap={1}
                px={{ base: 3, md: 5 }}
                borderBottomWidth='1px'
                borderColor='border'
                bg='bg'
                position='sticky'
                top={0}
                zIndex={20}
            >
                <Text fontSize='sm' fontWeight='bold' mr={3}>
                    Nexxus
                </Text>

                <TabButton active={tab === 'cp'} onClick={() => setTab('cp')} icon={<Wallet size={14} />}>
                    Client Portal
                </TabButton>
                <TabButton active={tab === 'crm'} onClick={() => setTab('crm')} icon={<Settings2 size={14} />}>
                    CRM
                </TabButton>

                <Box flex={1} />

                {DEMO ? (
                    <Badge size='sm' colorPalette={mode === 'legacy' ? 'red' : 'green'}>
                        {mode === 'legacy' ? 'legacy behaviour' : 'fixed behaviour'}
                    </Badge>
                ) : (
                    <Badge size='sm' colorPalette='blue'>
                        live API
                    </Badge>
                )}
            </Flex>

            {/*
              Both tabs stay mounted so the deposit form keeps its wallet, amount and
              country while you flip to the CRM and back — the whole point of the harness
              is comparing outcomes across a rule or behaviour change.
            */}
            <Box display={tab === 'cp' ? 'block' : 'none'}>
                <DepositPage />
            </Box>
            <Box display={tab === 'crm' ? 'block' : 'none'}>
                <CrmPage />
            </Box>
        </Box>
    );
}
