import { useQuery } from '@tanstack/react-query';
import { FlowActionService } from '@/api/services';
import { useBrandEnvironment } from './use-brand-environment';
import { useFlowType } from './use-flow-type';

/**
 * Flow actions for the selected brand, from the API.
 *
 * The deposit flow needs a real `actionId` for `fetch-psp`, and action ids belong to a
 * brand's flow configuration — so a hardcoded one only works for the brand it came from.
 */
export function useFlowActions() {
    const { isReady, selectedBrand, selectedEnvironment } = useBrandEnvironment();
    const { flowTypes, selectedFlowType } = useFlowType();

    // `selectedFlowType` is read out of the query cache without a subscription, so it does
    // not re-render this hook when it is first set. Fall back to the fetched list, which is
    // reactive, otherwise the actions query never becomes enabled on a cold load.
    const flowTypeId = selectedFlowType?.id ?? flowTypes?.[0]?.id;

    const query = useQuery({
        queryKey: ['flowActions', selectedBrand.id, selectedEnvironment.id, flowTypeId],
        queryFn: async () => {
            if (!flowTypeId) return [];
            return (await FlowActionService.getFlowActions(flowTypeId)).data ?? [];
        },
        enabled: isReady && Boolean(flowTypeId),
        retry: false,
    });

    return {
        flowActions: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
}

/**
 * Prefer a deposit action, else the first one.
 *
 * Matched on word boundaries and most-specific-first: a loose /fund/ also matches
 * "Refund", and a loose /deposit/ would match before an exactly-named "Deposit".
 */
export function pickDefaultDepositAction<T extends { id: string; name: string }>(
    actions: T[],
): T | null {
    if (actions.length === 0) return null;
    return (
        actions.find((action) => /^deposit$/i.test(action.name.trim())) ??
        actions.find((action) => /\bdeposit\b/i.test(action.name)) ??
        actions.find((action) => /\bpay[ -]?in\b/i.test(action.name)) ??
        actions[0]
    );
}
