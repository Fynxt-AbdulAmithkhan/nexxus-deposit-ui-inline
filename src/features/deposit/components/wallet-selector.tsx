import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Wallet as WalletIcon } from 'lucide-react';
import { useRef } from 'react';
import type { Wallet } from '../types';

type Props = {
    wallets: Wallet[];
    value: string | null;
    onChange: (walletId: string) => void;
};

function formatBalance(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Horizontal, scrollable row of selectable wallet cards (flag, currency, id, balance). */
export function WalletSelector({ wallets, value, onChange }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: number) => {
        scrollRef.current?.scrollBy({ left: direction * 260, behavior: 'smooth' });
    };

    return (
        <Box>
            <Flex align='center' gap={2} mb={3}>
                <WalletIcon size={16} />
                <Text fontWeight='medium' fontSize='sm'>
                    Select wallet
                </Text>
            </Flex>

            <Flex align='center' gap={2}>
                <IconButton
                    aria-label='Scroll wallets left'
                    size='sm'
                    variant='outline'
                    rounded='full'
                    flexShrink={0}
                    onClick={() => scroll(-1)}
                >
                    <ChevronLeft size={16} />
                </IconButton>

                <Flex
                    ref={scrollRef}
                    gap={3}
                    overflowX='auto'
                    flex={1}
                    py={1}
                    css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
                >
                    {wallets.map((wallet) => {
                        const selected = wallet.id === value;
                        return (
                            <Box
                                key={wallet.id}
                                role='button'
                                tabIndex={0}
                                aria-pressed={selected}
                                onClick={() => onChange(wallet.id)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onChange(wallet.id);
                                    }
                                }}
                                minW='210px'
                                borderWidth='2px'
                                borderColor={selected ? 'brand.solid' : 'border'}
                                bg={selected ? 'brand.subtle' : 'bg'}
                                borderRadius='lg'
                                p={4}
                                cursor='pointer'
                                transition='all 0.15s'
                                _hover={{ borderColor: 'brand.solid' }}
                            >
                                <Flex justify='space-between' align='flex-start' gap={2}>
                                    <Flex align='center' gap={2} minW={0}>
                                        <Text fontSize='xl' lineHeight='1'>
                                            {wallet.flag}
                                        </Text>
                                        <Text fontWeight='bold'>{wallet.currency}</Text>
                                    </Flex>
                                    <Text fontSize='xs' color='fg.subtle' whiteSpace='nowrap'>
                                        ID : {wallet.accountId}
                                    </Text>
                                </Flex>
                                <Text mt={3} fontSize='sm' color='fg.muted'>
                                    Balance: {formatBalance(wallet.balance)}
                                </Text>
                            </Box>
                        );
                    })}
                </Flex>

                <IconButton
                    aria-label='Scroll wallets right'
                    size='sm'
                    variant='outline'
                    rounded='full'
                    flexShrink={0}
                    onClick={() => scroll(1)}
                >
                    <ChevronRight size={16} />
                </IconButton>
            </Flex>
        </Box>
    );
}
