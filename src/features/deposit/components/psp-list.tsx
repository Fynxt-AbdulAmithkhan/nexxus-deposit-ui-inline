import { Flex, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { PackageOpen } from 'lucide-react';
import type { PspInfo } from '../types';
import { PspCard } from './psp-card';

type Props = {
    psps: PspInfo[];
    loading: boolean;
    selectedPspId: string | null;
    onSelect: (psp: PspInfo) => void;
};

export function PspList({ psps, loading, selectedPspId, onSelect }: Props) {
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

    if (psps.length === 0) {
        return (
            <Flex
                direction='column'
                align='center'
                justify='center'
                py={12}
                gap={3}
                textAlign='center'
            >
                <PackageOpen size={32} />
                <Text fontSize='sm' color='fg.muted'>
                    No payment providers available for this amount and currency.
                </Text>
            </Flex>
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
        </VStack>
    );
}
