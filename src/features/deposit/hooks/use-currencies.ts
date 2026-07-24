import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DepositService } from '../services/deposit.service';

/**
 * Brand-wise supported currencies for the side-panel dropdown.
 *
 * Tries GET /psps/currencies; if that is empty/unavailable (e.g. the endpoint is
 * permission-gated for the current token), falls back to the wallet's configured
 * supported-currency list so the flow still works.
 */
export function useCurrencies(fallback: string[]) {
    const query = useQuery({
        queryKey: ['psp-currencies'],
        queryFn: () => DepositService.getSupportedCurrencies(),
        staleTime: 10 * 60 * 1000,
        retry: 0,
    });

    const currencies = useMemo(() => {
        const fromApi = query.data ?? [];
        return fromApi.length > 0 ? fromApi : fallback;
    }, [query.data, fallback]);

    return {
        currencies,
        isLoading: query.isLoading,
        usingFallback: !query.data || query.data.length === 0,
    };
}
