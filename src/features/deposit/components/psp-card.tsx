import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { PspInfo } from '../types';

type Props = {
    psp: PspInfo;
    selected: boolean;
    onSelect: (psp: PspInfo) => void;
    disabled?: boolean;
};

/** Radio-style payment-method card: a radio dot on the left, the PSP logo on the right. */
export function PspCard({ psp, selected, onSelect, disabled }: Props) {
    const [logoOk, setLogoOk] = useState(Boolean(psp.logo));

    return (
        <Box
            role='radio'
            aria-checked={selected}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onSelect(psp)}
            onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(psp);
                }
            }}
            display='flex'
            alignItems='center'
            gap={3}
            borderWidth='2px'
            borderColor={selected ? 'brand.solid' : 'border'}
            bg='bg'
            borderRadius='xl'
            px={4}
            py={4}
            minH='68px'
            cursor={disabled ? 'not-allowed' : 'pointer'}
            opacity={disabled ? 0.6 : 1}
            transition='all 0.15s'
            _hover={disabled ? undefined : { borderColor: 'brand.solid' }}
        >
            {/* radio indicator */}
            <Flex
                align='center'
                justify='center'
                boxSize='20px'
                borderRadius='full'
                borderWidth='2px'
                borderColor={selected ? 'brand.solid' : 'border.muted'}
                flexShrink={0}
            >
                {selected && <Box boxSize='10px' borderRadius='full' bg='brand.solid' />}
            </Flex>

            {/* logo (falls back to name, then a placeholder icon) */}
            <Flex flex={1} align='center' justify='center' minH='32px' color='fg.subtle'>
                {logoOk && psp.logo ? (
                    <Image
                        src={psp.logo}
                        alt={psp.name}
                        maxH='34px'
                        maxW='150px'
                        objectFit='contain'
                        onError={() => setLogoOk(false)}
                    />
                ) : psp.name ? (
                    <Text fontWeight='semibold' color='fg'>
                        {psp.name}
                    </Text>
                ) : (
                    <ImageOff size={22} />
                )}
            </Flex>
        </Box>
    );
}
