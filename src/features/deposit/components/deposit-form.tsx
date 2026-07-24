import { Box, chakra, Flex, Text, VStack } from '@chakra-ui/react';
import { ArrowRight } from 'lucide-react';
import type { Wallet } from '../types';
import { getRate } from '../utils/conversion';
import { formatMoney, formatRate } from '../utils/format';

type Props = {
    wallet: Wallet;
    currencies: string[];
    currency: string;
    onCurrencyChange: (currency: string) => void;
    amount: string;
    onAmountChange: (amount: string) => void;
    convertedAmount: number;
    usingFallbackCurrencies: boolean;
};

export function DepositForm({
    wallet,
    currencies,
    currency,
    onCurrencyChange,
    amount,
    onAmountChange,
    convertedAmount,
    usingFallbackCurrencies,
}: Props) {
    const rate = getRate(wallet.currency, currency);
    const sameCurrency = wallet.currency === currency;
    const amountNum = Number(amount);
    const showConversion = amountNum > 0 && Boolean(currency) && !sameCurrency;

    return (
        <VStack align='stretch' gap={5}>
            {/* Amount (in wallet currency) */}
            <Box>
                <Text fontWeight='medium' fontSize='sm' mb={2}>
                    Amount to deposit
                </Text>
                <Flex
                    align='center'
                    h='48px'
                    px={3}
                    borderWidth='1px'
                    borderColor='border'
                    borderRadius='md'
                    bg='bg'
                    _focusWithin={{ borderColor: 'brand.solid' }}
                >
                    <Text color='fg.muted' fontWeight='medium' mr={2}>
                        {wallet.currency}
                    </Text>
                    <chakra.input
                        type='number'
                        inputMode='decimal'
                        min={0}
                        step='0.01'
                        placeholder='0.00'
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        flex={1}
                        h='full'
                        bg='transparent'
                        outline='none'
                        border='none'
                        fontSize='lg'
                        fontWeight='semibold'
                    />
                </Flex>
                <Text mt={1} fontSize='xs' color='fg.muted'>
                    From {wallet.label} · balance {formatMoney(wallet.balance, wallet.currency)}
                </Text>
            </Box>

            {/* Supported currency */}
            <Box>
                <Text fontWeight='medium' fontSize='sm' mb={2}>
                    Supported currency
                </Text>
                <chakra.select
                    value={currency}
                    onChange={(e) => onCurrencyChange(e.target.value)}
                    w='full'
                    h='48px'
                    px={3}
                    borderWidth='1px'
                    borderColor='border'
                    borderRadius='md'
                    bg='bg'
                    cursor='pointer'
                    fontSize='sm'
                >
                    <option value='' disabled>
                        Select currency
                    </option>
                    {currencies.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </chakra.select>
                <Text mt={1} fontSize='xs' color='fg.muted'>
                    {usingFallbackCurrencies
                        ? 'Currencies configured for this wallet.'
                        : 'Supported currencies for this brand.'}
                </Text>
            </Box>

            {/* Conversion preview */}
            {showConversion && (
                <Box borderWidth='1px' borderColor='brand.emphasized' bg='brand.subtle' borderRadius='md' p={4}>
                    <Flex align='center' justify='space-between' gap={3}>
                        <Box>
                            <Text fontSize='xs' color='fg.muted'>
                                You pay
                            </Text>
                            <Text fontWeight='semibold'>{formatMoney(amountNum, wallet.currency)}</Text>
                        </Box>
                        <ArrowRight size={18} />
                        <Box textAlign='right'>
                            <Text fontSize='xs' color='fg.muted'>
                                Provider receives
                            </Text>
                            <Text fontWeight='semibold' color='brand.fg'>
                                {formatMoney(convertedAmount, currency)}
                            </Text>
                        </Box>
                    </Flex>
                    <Text mt={2} fontSize='xs' color='fg.muted'>
                        {formatRate(wallet.currency, currency, rate)} · indicative rate
                    </Text>
                </Box>
            )}
        </VStack>
    );
}
