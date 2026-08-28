import { Box, HStack, IconButton, Spinner, Text, VStack } from '@chakra-ui/react';
import { RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    isOpen: boolean;
    /** Full URL to load (the transaction sessionUrl). */
    url: string;
    onClose?: () => void;
};

/**
 * Full-screen payment surface. Loads the transaction `sessionUrl` (the hosted
 * Nexxus payment widget) in a sandboxed iframe. Adapted from nexxus/widget.
 */
export function IframePayment({ isOpen, url, onClose }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
    }, [isOpen, url, reloadKey]);

    const iframeKey = useMemo(() => `${url}:${reloadKey}`, [url, reloadKey]);

    if (!isOpen) return null;

    return (
        <Box position='fixed' inset={0} bg='white' zIndex={9999} display='flex' flexDirection='column'>
            <HStack
                w='full'
                p={4}
                borderBottomWidth='1px'
                borderColor='gray.200'
                justify='space-between'
                bg='white'
            >
                <Text fontSize='lg' fontWeight='semibold' color='gray.800'>
                    Complete Payment
                </Text>
                <HStack gap={2}>
                    <IconButton
                        aria-label='Refresh'
                        size='sm'
                        variant='ghost'
                        onClick={() => setReloadKey((k) => k + 1)}
                    >
                        <RefreshCw size={18} />
                    </IconButton>
                    <IconButton aria-label='Close' size='sm' variant='ghost' onClick={onClose}>
                        <X size={18} />
                    </IconButton>
                </HStack>
            </HStack>

            {isLoading && (
                <Box position='absolute' top='50%' left='50%' transform='translate(-50%, -50%)' zIndex={20}>
                    <VStack gap={3}>
                        <Spinner size='lg' color='brand.solid' />
                        <Text fontSize='sm' color='gray.600'>
                            Loading payment page...
                        </Text>
                    </VStack>
                </Box>
            )}

            <Box flex={1} position='relative' overflow='hidden'>
                <iframe
                    key={iframeKey}
                    src={url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    onLoad={() => setIsLoading(false)}
                    sandbox='allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation'
                    title='Payment Page'
                />
            </Box>
        </Box>
    );
}
