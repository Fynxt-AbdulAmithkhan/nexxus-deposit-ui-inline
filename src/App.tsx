import { Badge, Box, chakra, Flex, Text } from '@chakra-ui/react';
import { Settings2, Wallet } from 'lucide-react';
import { useState } from 'react';
import { BrandEnvSelector } from './features/brand-env/brand-env-selector';
import { CrmPage } from './features/crm/crm-page';
import { DepositPage } from './features/deposit/deposit-page';
import { DEMO } from './features/deposit/demo';

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
            color={active ? 'primary.fg' : 'fg.muted'}
            borderBottomWidth='2px'
            borderColor={active ? 'primary.fg' : 'transparent'}
            bg='transparent'
        >
            {icon}
            {children}
        </chakra.button>
    );
}

export default function App() {
    const [tab, setTab] = useState<Tab>('cp');

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

                {!DEMO && <BrandEnvSelector />}

                <Badge size='sm' colorPalette={DEMO ? 'gray' : 'blue'} ml={2}>
                    {DEMO ? 'sample data' : 'live API'}
                </Badge>
            </Flex>

            {/*
              Both tabs stay mounted so the deposit form keeps its wallet, amount, country
              and customer tag while you switch to the CRM to change a rule and come back.
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
