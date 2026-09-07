import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { ConfiguredPSP } from '../service.types';
import type { ApiResponse } from '../types';

/** Normalise a list that may arrive as string[] or as [{ code | currency | value | name }]. */
function normaliseCodes(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
                const obj = item as Record<string, unknown>;
                const code = obj.code ?? obj.currency ?? obj.value ?? obj.name;
                return typeof code === 'string' ? code : null;
            }
            return null;
        })
        .filter((code): code is string => Boolean(code));
}

/** PSP lookups the rule forms need (options for the PSP, currency and country pickers). */
export const PSPService = {
    getConfiguredPSPs: (): Promise<ApiResponse<ConfiguredPSP[]>> =>
        apiClient.get<ConfiguredPSP[]>(API_ENDPOINTS.psp.configured()),

    getPSPsByActionAndCurrency: (
        actionId: string,
        currency: string,
    ): Promise<ApiResponse<ConfiguredPSP[]>> =>
        apiClient.get<ConfiguredPSP[]>(API_ENDPOINTS.psp.byActionAndCurrency(actionId, currency)),

    getCurrencies: async (): Promise<ApiResponse<string[]>> => {
        const res = await apiClient.get<unknown>(API_ENDPOINTS.psp.currencies());
        return { data: normaliseCodes(res.data), status: res.status };
    },

    getCountries: async (): Promise<ApiResponse<string[]>> => {
        const res = await apiClient.get<unknown>(API_ENDPOINTS.psp.countries());
        return { data: normaliseCodes(res.data), status: res.status };
    },
};
