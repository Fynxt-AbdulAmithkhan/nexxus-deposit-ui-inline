import { Box, Flex, Text } from '@chakra-ui/react';
import type { FeeBreakdown, PspInfo } from '../types';
import { formatMoney } from '../utils/format';

type Props = {
    psp: PspInfo;
};

/** "2% + $1.00" / "2%" / "$1.00" — whichever components the rule actually configured. */
function describeBreakdown(breakdown: FeeBreakdown | undefined, currency: string): string | null {
    if (!breakdown) return null;

    const parts: string[] = [];
    if (breakdown.feePercentage) parts.push(`${breakdown.feePercentage}%`);
    if (breakdown.fixedFee) parts.push(formatMoney(breakdown.fixedFee, currency));

    return parts.length > 0 ? parts.join(' + ') : null;
}

function Row({
    label,
    hint,
    value,
    tone,
}: {
    label: string;
    hint?: string | null;
    value: string;
    tone?: string;
}) {
    return (
        <Flex align='baseline' justify='space-between' gap={2}>
            <Flex align='baseline' gap={1.5} minW={0}>
                <Text fontSize='xs' color='fg.muted' truncate>
                    {label}
                </Text>
                {hint && (
                    <Text fontSize='2xs' color='fg.subtle' whiteSpace='nowrap'>
                        {hint}
                    </Text>
                )}
            </Flex>
            <Text fontSize='xs' fontWeight='medium' color={tone ?? 'fg'} whiteSpace='nowrap'>
                {value}
            </Text>
        </Flex>
    );
}

/**
 * Fee breakdown for one PSP, straight from RequestOutputDto.PspInfo.
 *
 * The brand service scopes a fee rule by its configured countries, so this panel is what
 * makes that scoping observable: change the customer country and a rule that does not
 * cover the new country stops being charged, leaving the explicit "no fee" state.
 */
export function PspFeeSummary({ psp }: Props) {
    const currency = psp.currency;

    if (!psp.feeApplied) {
        return (
            <Box borderTopWidth='1px' borderColor='border' pt={2} mt={2}>
                <Row label='No fee applied' value={formatMoney(psp.originalAmount, currency)} />
            </Box>
        );
    }

    const inclusive = describeBreakdown(psp.fee?.inclusiveFee, currency);
    const exclusive = describeBreakdown(psp.fee?.exclusiveFee, currency);

    return (
        <Box borderTopWidth='1px' borderColor='border' pt={2} mt={2}>
            <Flex direction='column' gap={1}>
                {psp.inclusiveFeeAmount ? (
                    <Row
                        label='Inclusive fee'
                        hint={inclusive}
                        value={`- ${formatMoney(psp.inclusiveFeeAmount, currency)}`}
                    />
                ) : null}

                {psp.exclusiveFeeAmount ? (
                    <Row
                        label='Exclusive fee'
                        hint={exclusive}
                        value={`+ ${formatMoney(psp.exclusiveFeeAmount, currency)}`}
                    />
                ) : null}

                <Row label='Total to pay' value={formatMoney(psp.totalAmount, currency)} tone='fg' />

                {typeof psp.netAmountToUser === 'number' && (
                    <Row
                        label='You receive'
                        value={formatMoney(psp.netAmountToUser, currency)}
                        tone='brand.solid'
                    />
                )}
            </Flex>
        </Box>
    );
}
