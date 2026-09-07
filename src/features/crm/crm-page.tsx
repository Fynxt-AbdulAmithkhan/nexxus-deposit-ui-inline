import { Box, Flex, Text } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { DEMO } from '../deposit/demo';
import FeeList from './fee/list';
import TransactionLimitList from './transaction-limits/list';

/**
 * Stand-in for the CRM's Rules Management screen, using the CRM's own PageHeader, Tabs,
 * DataTable and modal forms so it matches what the real CRM shows.
 *
 * Unlike the CRM this drives the brand service through the environment secret token
 * (`/fees` and `/transaction-limits` are both in the service's secret-token-paths), so a
 * rule created here is a real rule and the deposit flow in the Client Portal tab reflects
 * whatever the deployed backend actually does with it.
 */
export function CrmPage() {
    const [activeTab, setActiveTab] = useState('transaction-limits');

    const tabItems = useMemo(
        () => [
            {
                id: 'transaction-limits',
                label: 'Transaction Limits',
                content: <TransactionLimitList />,
            },
            {
                id: 'fees',
                label: 'Fees Management',
                content: <FeeList />,
            },
        ],
        [],
    );

    return (
        <Box px={{ base: 3, md: 6 }} py={{ base: 4, md: 6 }}>
            <PageHeader
                subtitle='Manage all your business rules and configurations'
                title='Rules Management'
            />

            {DEMO && (
                <Flex
                    align='flex-start'
                    gap={2}
                    mb={4}
                    p={3}
                    borderWidth='1px'
                    borderColor='border'
                    bg='bg.muted'
                    borderRadius='md'
                >
                    <Box color='fg.muted' mt='2px'>
                        <AlertTriangle size={16} />
                    </Box>
                    <Text fontSize='xs' color='fg.muted'>
                        <b>Preview build.</b> These screens read and write real rules through the brand
                        service, so they need the live API. Run without <b>VITE_DEMO</b> (Codespaces, the
                        container, or local dev with the proxy) to use them.
                    </Text>
                </Flex>
            )}

            <Tabs
                activeTab={activeTab}
                items={tabItems}
                onTabChange={setActiveTab}
                size='md'
                variant='underline'
            />
        </Box>
    );
}
