import { apiClient, API_ENDPOINTS } from '@/api';
import { DEMO, demoCreateTransaction, demoCurrencies, demoFetchPsp } from '../demo';
import type {
    CreateTransactionRequest,
    CreateTransactionResponse,
    FetchPspRequest,
    FetchPspResponse,
} from '../types';

/**
 * Normalise the /psps/currencies payload, which may arrive as a bare string[]
 * or as a list of `{ code | currency | value }` objects.
 */
function normaliseCurrencies(raw: unknown): string[] {
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
        .filter((c): c is string => !!c);
}

export const DepositService = {
    /** GET /psps/currencies -> supported currencies for the brand + environment. */
    async getSupportedCurrencies(): Promise<string[]> {
        if (DEMO) return demoCurrencies();
        const res = await apiClient.get<unknown>(API_ENDPOINTS.psp.currencies());
        return normaliseCurrencies(res.data);
    },

    /** POST /requests/fetch-psp -> { requestId, psps[] }. */
    async fetchPsp(body: FetchPspRequest): Promise<FetchPspResponse> {
        if (DEMO) return demoFetchPsp(body);
        const res = await apiClient.post<FetchPspResponse, FetchPspRequest>(
            API_ENDPOINTS.requests.fetchPsp(),
            body,
        );
        return res.data;
    },

    /** POST /transactions -> { txnId, sessionUrl }. */
    async createTransaction(body: CreateTransactionRequest): Promise<CreateTransactionResponse> {
        if (DEMO) return demoCreateTransaction();
        const res = await apiClient.post<CreateTransactionResponse, CreateTransactionRequest>(
            API_ENDPOINTS.transactions.create(),
            body,
        );
        return res.data;
    },
};
