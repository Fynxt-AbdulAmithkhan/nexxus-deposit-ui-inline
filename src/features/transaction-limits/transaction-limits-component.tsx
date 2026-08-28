import { Badge, Box, HStack, Spinner, Table, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '@/api';
import { LimitAmountCell } from './limit-amount-cell';
import type { LimitAction } from './transaction-limit-actions';

/**
 * Same prop contract the CRM mounts this with:
 *
 *   <TransactionLimitsComponent
 *       domain={domain}
 *       secretToken={secretToken}
 *       brandId={resolvedBrandId}
 *       environmentId={environmentId}
 *       flowTypeId={flowTypeId}
 *   />
 *
 * `flowTypeId` is accepted for parity but is not part of the list request --
 * GET /transaction-limits takes no flow-type parameter. It only scopes the flow
 * actions offered by the create/edit form, which this port does not include.
 */
export type TransactionLimitsComponentProps = {
    domain: string;
    secretToken: string;
    brandId?: string;
    environmentId?: string;
    flowTypeId?: string;
    apiPrefix?: string;
};

type TransactionLimit = {
    id: number;
    name: string;
    currency: string;
    countries?: string[];
    psps?: { id: string; name: string | null }[];
    pspActions?: LimitAction[];
    createdAt?: string;
};

function formatDate(value: string | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        .replace(',', ' |');
}

export function TransactionLimitsComponent({
    domain,
    secretToken,
    brandId,
    environmentId,
    apiPrefix = '/nexxus/v1',
}: TransactionLimitsComponentProps) {
    const query = useQuery({
        queryKey: ['transaction-limits', domain, brandId, environmentId],
        retry: false,
        queryFn: async () => {
            const client = new ApiClient(`${domain}${apiPrefix}`);
            const headers: Record<string, string> = {};
            if (secretToken) headers['x-secret-token'] = secretToken;
            if (brandId) headers['X-BRAND-ID'] = brandId;
            if (environmentId) headers['X-ENV-ID'] = environmentId;
            const res = await client.get<TransactionLimit[]>('/transaction-limits', {
                headers,
                skipAuth: true,
            });
            return res.data ?? [];
        },
    });

    if (query.isLoading) {
        return (
            <HStack p={6}>
                <Spinner size='sm' />
                <Text fontSize='sm'>Loading transaction limits...</Text>
            </HStack>
        );
    }

    if (query.isError) {
        return (
            <Box bg='red.50' borderRadius='md' p={4}>
                <Text color='red.700' fontSize='sm'>
                    {(query.error as Error).message}
                </Text>
            </Box>
        );
    }

    const limits = query.data ?? [];

    if (limits.length === 0) {
        return (
            <Text color='gray.500' fontSize='sm' p={6}>
                No transaction limits for this brand and environment.
            </Text>
        );
    }

    return (
        <Table.Root size='sm' variant='outline'>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Currency</Table.ColumnHeader>
                    <Table.ColumnHeader>Country</Table.ColumnHeader>
                    <Table.ColumnHeader>PSP</Table.ColumnHeader>
                    <Table.ColumnHeader>Deposit</Table.ColumnHeader>
                    <Table.ColumnHeader>Withdrawal</Table.ColumnHeader>
                    <Table.ColumnHeader>Created On</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {limits.map((limit) => (
                    <Table.Row key={limit.id}>
                        <Table.Cell fontSize='xs' fontWeight='medium'>
                            {limit.name}
                        </Table.Cell>
                        <Table.Cell fontSize='xs'>{limit.currency}</Table.Cell>
                        <Table.Cell>
                            <HStack gap={1} wrap='wrap'>
                                {(limit.countries ?? []).slice(0, 3).map((country) => (
                                    <Badge fontSize='xs' key={country} variant='subtle'>
                                        {country}
                                    </Badge>
                                ))}
                                {(limit.countries ?? []).length > 3 && (
                                    <Badge fontSize='xs' variant='subtle'>
                                        +{(limit.countries ?? []).length - 3}
                                    </Badge>
                                )}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell>
                            <VStack align='start' gap={1}>
                                {(limit.psps ?? []).map((psp) => (
                                    <Badge
                                        colorPalette='purple'
                                        fontSize='xs'
                                        key={psp.id}
                                        variant='subtle'
                                    >
                                        {psp.name ?? psp.id}
                                    </Badge>
                                ))}
                            </VStack>
                        </Table.Cell>
                        <Table.Cell>
                            <LimitAmountCell actions={limit.pspActions} kind='deposit' />
                        </Table.Cell>
                        <Table.Cell>
                            <LimitAmountCell actions={limit.pspActions} kind='withdrawal' />
                        </Table.Cell>
                        <Table.Cell fontSize='xs'>{formatDate(limit.createdAt)}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}
