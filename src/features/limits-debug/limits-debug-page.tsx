import {
    Badge,
    Box,
    Button,
    Code,
    Heading,
    HStack,
    Input,
    Spinner,
    Table,
    Text,
    VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/api';
import {
    classifyLimitAction,
    fixedCellValue,
    getActionLabel,
    legacyCellValue,
    type LimitAction,
} from '../transaction-limits/transaction-limit-actions';

type TransactionLimit = {
    id: number;
    name: string;
    currency: string;
    pspActions?: LimitAction[];
};

const KIND_COLOR: Record<string, string> = {
    deposit: 'green',
    withdrawal: 'blue',
    unclassified: 'orange',
};

function range(action: LimitAction): string {
    return `${action.minAmount.toFixed(2)} - ${action.maxAmount.toFixed(2)}`;
}

/**
 * Harness for the "Deposit / Withdrawal show No limits" defect.
 *
 * Calls GET /transaction-limits with the environment secret token, then shows the
 * raw pspActions next to what the old and fixed classifiers make of them. Point
 * VITE_API_TARGET at any environment (staging, UAT, local) to compare.
 */
export function LimitsDebugPage() {
    const [brandId, setBrandId] = useState('');
    const [environmentId, setEnvironmentId] = useState('');

    const query = useQuery({
        queryKey: ['limits-debug', brandId, environmentId],
        queryFn: async () => {
            const headers: Record<string, string> = {};
            if (brandId.trim()) headers['X-BRAND-ID'] = brandId.trim();
            if (environmentId.trim()) headers['X-ENV-ID'] = environmentId.trim();
            const res = await apiClient.get<TransactionLimit[]>('/transaction-limits', {
                headers,
            });
            return res.data ?? [];
        },
    });

    const limits = query.data ?? [];
    const totalActions = limits.reduce((n, l) => n + (l.pspActions?.length ?? 0), 0);
    const missingNames = limits.reduce(
        (n, l) => n + (l.pspActions ?? []).filter((a) => !a.flowActionName?.trim()).length,
        0,
    );

    return (
        <Box maxW='1200px' mx='auto' p={6}>
            <VStack align='stretch' gap={5}>
                <Box>
                    <Heading size='lg'>Transaction Limits — classification harness</Heading>
                    <Text color='gray.600' fontSize='sm' mt={1}>
                        GET /transaction-limits through the dev proxy. Brand and environment default
                        to whatever the secret token resolves to; override them to inspect another
                        brand.
                    </Text>
                </Box>

                <HStack gap={3}>
                    <Input
                        onChange={(e) => setBrandId(e.target.value)}
                        placeholder='X-BRAND-ID (optional)'
                        size='sm'
                        value={brandId}
                    />
                    <Input
                        onChange={(e) => setEnvironmentId(e.target.value)}
                        placeholder='X-ENV-ID (optional)'
                        size='sm'
                        value={environmentId}
                    />
                    <Button onClick={() => query.refetch()} size='sm'>
                        Fetch
                    </Button>
                </HStack>

                {query.isFetching && (
                    <HStack>
                        <Spinner size='sm' />
                        <Text fontSize='sm'>Loading...</Text>
                    </HStack>
                )}

                {query.isError && (
                    <Box bg='red.50' borderRadius='md' p={3}>
                        <Text color='red.700' fontSize='sm'>
                            {(query.error as Error).message}
                        </Text>
                    </Box>
                )}

                {!(query.isFetching || query.isError) && (
                    <HStack fontSize='sm' gap={4}>
                        <Text>
                            <b>{limits.length}</b> limits
                        </Text>
                        <Text>
                            <b>{totalActions}</b> actions
                        </Text>
                        <Text color={missingNames > 0 ? 'red.600' : 'green.700'}>
                            <b>{missingNames}</b> missing flowActionName
                        </Text>
                    </HStack>
                )}

                {missingNames > 0 && (
                    <Box bg='orange.50' borderRadius='md' p={3}>
                        <Text color='orange.800' fontSize='sm'>
                            Some actions came back without a <Code>flowActionName</Code>. Deposit
                            and withdrawal cannot be told apart for those, so the fix can only show
                            them as unlabelled. Closing that gap needs a discriminator on the API
                            response (flowTypeId or transactionType).
                        </Text>
                    </Box>
                )}

                {limits.map((limit) => (
                    <Box borderRadius='md' borderWidth='1px' key={limit.id} p={4}>
                        <Heading mb={3} size='sm'>
                            {limit.name}{' '}
                            <Text as='span' color='gray.500' fontWeight='normal'>
                                ({limit.currency})
                            </Text>
                        </Heading>

                        <Table.Root size='sm' variant='outline'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>flowActionName</Table.ColumnHeader>
                                    <Table.ColumnHeader>flowActionId</Table.ColumnHeader>
                                    <Table.ColumnHeader>Range</Table.ColumnHeader>
                                    <Table.ColumnHeader>Classified as</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {(limit.pspActions ?? []).map((action) => {
                                    const kind = classifyLimitAction(action);
                                    const hasName = !!action.flowActionName?.trim();
                                    return (
                                        <Table.Row key={action.flowActionId}>
                                            <Table.Cell>
                                                {hasName ? (
                                                    action.flowActionName
                                                ) : (
                                                    <Code color='red.600'>null</Code>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Code fontSize='xs'>{action.flowActionId}</Code>
                                            </Table.Cell>
                                            <Table.Cell>{range(action)}</Table.Cell>
                                            <Table.Cell>
                                                <Badge colorPalette={KIND_COLOR[kind]}>
                                                    {kind}
                                                </Badge>
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                                {(limit.pspActions ?? []).length === 0 && (
                                    <Table.Row>
                                        <Table.Cell colSpan={4}>
                                            <Text color='gray.500' fontSize='sm'>
                                                No pspActions returned, so No limits is the correct
                                                display here.
                                            </Text>
                                        </Table.Cell>
                                    </Table.Row>
                                )}
                            </Table.Body>
                        </Table.Root>

                        <Table.Root mt={3} size='sm' variant='outline'>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader>Column</Table.ColumnHeader>
                                    <Table.ColumnHeader>Before (old logic)</Table.ColumnHeader>
                                    <Table.ColumnHeader>After (fixed)</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {(['deposit', 'withdrawal'] as const).map((kind) => {
                                    const before = legacyCellValue(limit.pspActions, kind);
                                    const after = fixedCellValue(limit.pspActions, kind);
                                    return (
                                        <Table.Row key={kind}>
                                            <Table.Cell textTransform='capitalize'>
                                                {kind}
                                            </Table.Cell>
                                            <Table.Cell
                                                color={
                                                    before === 'No limits' ? 'red.600' : 'gray.800'
                                                }
                                            >
                                                {before}
                                            </Table.Cell>
                                            <Table.Cell
                                                color={
                                                    after === 'No limits' ? 'red.600' : 'green.700'
                                                }
                                                fontWeight='medium'
                                            >
                                                {after}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table.Root>

                        {(limit.pspActions ?? []).length > 0 && (
                            <Text color='gray.600' fontSize='xs' mt={2}>
                                Tooltip on the fixed cell:{' '}
                                {(limit.pspActions ?? [])
                                    .map((a) => `${getActionLabel(a)}: ${range(a)}`)
                                    .join(' | ')}
                            </Text>
                        )}
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}
