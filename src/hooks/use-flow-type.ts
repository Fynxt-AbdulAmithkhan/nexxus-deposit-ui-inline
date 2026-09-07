import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { FlowTypeService } from '@/api/services';
import type { FlowType } from '@/api/services';
import { useBrandEnvironment } from './use-brand-environment';

/**
 * Adapted from the CRM's useFlowType. The CRM gated the query on its auth store; here the
 * gate is whether the secret token is configured, since that is what authorises the call.
 * The first flow type is auto-selected, as in the CRM.
 */
export const useFlowType = () => {
    const queryClient = useQueryClient();
    const { isReady, selectedBrand, selectedEnvironment } = useBrandEnvironment();

    const {
        data: flowTypes,
        isLoading,
        error,
    } = useQuery({
        // Keyed on brand + environment so switching brand refetches that brand's types.
        queryKey: ['flowTypes', selectedBrand.id, selectedEnvironment.id],
        queryFn: async () => {
            const response = await FlowTypeService.getFlowTypes();
            if (!response.data) {
                throw new Error('Failed to fetch flow types');
            }
            return response.data;
        },
        retry: false,
        enabled: isReady,
        refetchOnWindowFocus: false,
    });

    const cachedFlowType = queryClient.getQueryData<FlowType>(['selectedFlowType']);

    // The cache slot is not brand-scoped, so after switching brand it still holds the
    // previous brand's flow type — which would resolve that brand's flow actions. Only
    // treat it as selected while it actually belongs to the brand's fetched list.
    const selectedFlowType =
        cachedFlowType && flowTypes?.some((type) => type.id === cachedFlowType.id)
            ? cachedFlowType
            : undefined;

    useEffect(() => {
        if (!flowTypes || flowTypes.length === 0) return;
        if (selectedFlowType) return;
        queryClient.setQueryData(['selectedFlowType'], flowTypes[0]);
    }, [selectedFlowType, flowTypes, queryClient]);

    const updateSelectedFlowType = (flowType: FlowType | null) => {
        if (flowType) {
            queryClient.setQueryData(['selectedFlowType'], flowType);
        } else {
            queryClient.removeQueries({ queryKey: ['selectedFlowType'] });
        }
    };

    return { flowTypes, selectedFlowType, updateSelectedFlowType, isLoading, error };
};
