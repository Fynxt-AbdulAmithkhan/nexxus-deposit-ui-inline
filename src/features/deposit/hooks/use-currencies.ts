import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useBrandEnvironment } from '@/hooks/use-brand-environment';
import { DepositService } from '../services/deposit.service';

/**
 * Brand-wise supported currencies for the deposit form.
 *
 * Tries GET /psps/currencies; if that is empty/unavailable (e.g. the endpoint is
 * permission-gated for the current token), falls back to the wallet's configured
 * supported-currency list so the flow still works.
 *
 * The query is keyed on brand + environment: the supported set is per brand, so without
 * that the first brand's currencies stay cached for every brand you switch to.
 */
export function useCurrencies(fallback: string[]) {
    const { selectedBrand, selectedEnvironment } = useBrandEnvironment();

    const query = useQuery({
        queryKey: ['psp-currencies', selectedBrand.id, selectedEnvironment.id],
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
