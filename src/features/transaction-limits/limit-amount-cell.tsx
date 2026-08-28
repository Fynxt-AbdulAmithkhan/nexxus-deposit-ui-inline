import { Text } from '@chakra-ui/react';
import {
    findActionByKind,
    getActionLabel,
    getUnclassifiedActions,
    type LimitAction,
} from './transaction-limit-actions';

type Props = {
    actions: LimitAction[] | undefined;
    kind: 'deposit' | 'withdrawal';
};

function formatRange(min: number, max: number): string {
    return `${min.toFixed(2)} - ${max.toFixed(2)}`;
}

/**
 * Port of nexxus `LimitAmountFormatter`.
 *
 * "No limits" appears only when the limit really has no actions. When actions
 * exist but none belong to this column, the cell says how many are unlabelled
 * and lists them on hover, so a configured limit is never reported as absent.
 */
export function LimitAmountCell({ actions, kind }: Props) {
    const match = findActionByKind(actions, kind);

    if (match) {
        return (
            <Text color='gray.700' fontSize='xs'>
                {formatRange(match.minAmount, match.maxAmount)}
            </Text>
        );
    }

    if (!actions?.length) {
        return (
            <Text color='gray.500' fontSize='xs'>
                No limits
            </Text>
        );
    }

    const unclassified = getUnclassifiedActions(actions);
    if (unclassified.length === 0) {
        return (
            <Text color='gray.500' fontSize='xs'>
                —
            </Text>
        );
    }

    const summary = unclassified
        .map(
            (entry) => `${getActionLabel(entry)}: ${formatRange(entry.minAmount, entry.maxAmount)}`,
        )
        .join('\n');

    return (
        <Text
            color='gray.500'
            fontSize='xs'
            textDecoration='underline dotted'
            title={summary}
            cursor='help'
        >
            {unclassified.length} unlabelled
        </Text>
    );
}
