import { Box, Flex, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { Ban, PackageOpen } from 'lucide-react';
import type { ExcludedPsp, PspInfo } from '../types';
import { PspCard } from './psp-card';

type Props = {
    psps: PspInfo[];
    loading: boolean;
    selectedPspId: string | null;
    onSelect: (psp: PspInfo) => void;
    /** Demo harness only: PSPs the transaction-limit filter removed. */
    excluded?: ExcludedPsp[];
};

/**
 * Providers removed by the transaction-limit filter. The real API simply omits them; the
 * harness lists them with the cause, because "the PSP vanished" is the only symptom the
 * limit model produces and it is otherwise invisible.
 */
function ExcludedList({ excluded }: { excluded: ExcludedPsp[] }) {
    return (
        <Box mt={4}>
            <Flex align='center' gap={1.5} mb={2}>
                <Box color='fg.subtle'>
                    <Ban size={13} />
                </Box>
                <Text fontSize='xs' color='fg.muted'>
                    Filtered out by transaction limits
                </Text>
            </Flex>

            <VStack align='stretch' gap={1.5}>
                {excluded.map((psp) => (
                    <Box
                        key={psp.id}
                        borderWidth='1px'
                        borderColor='border'
                        borderStyle='dashed'
                        borderRadius='md'
                        px={3}
                        py={2}
                        bg='bg.muted'
                    >
                        <Text fontSize='sm' fontWeight='medium' color='fg.muted'>
                            {psp.name}
                        </Text>
                        <Text fontSize='xs' color='fg.subtle'>
                            {psp.reason}
                        </Text>
                    </Box>
                ))}
            </VStack>
        </Box>
    );
}

export function PspList({ psps, loading, selectedPspId, onSelect, excluded }: Props) {
    if (loading) {
        return (
            <Flex direction='column' align='center' justify='center' py={12} gap={3}>
                <Spinner size='lg' color='brand.solid' />
                <Text fontSize='sm' color='fg.muted'>
                    Finding available payment providers…
                </Text>
            </Flex>
        );
    }

    const hasExcluded = Boolean(excluded && excluded.length > 0);

    if (psps.length === 0) {
        return (
            <Box>
                <Flex direction='column' align='center' justify='center' py={10} gap={3} textAlign='center'>
                    <PackageOpen size={32} />
                    <Text fontSize='sm' color='fg.muted'>
                        No payment providers available for this amount and currency.
                    </Text>
                </Flex>
                {hasExcluded && <ExcludedList excluded={excluded ?? []} />}
            </Box>
        );
    }

    return (
        <VStack align='stretch' gap={3}>
            <Text fontSize='sm' color='fg.muted'>
                Select Payment Method :
            </Text>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                {psps.map((psp) => (
                    <PspCard
                        key={psp.id}
                        psp={psp}
                        selected={psp.id === selectedPspId}
                        onSelect={onSelect}
                    />
                ))}
            </SimpleGrid>
            {hasExcluded && <ExcludedList excluded={excluded ?? []} />}
        </VStack>
    );
}
