import { apiClient, API_ENDPOINTS } from '@/api';
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
        const res = await apiClient.get<unknown>(API_ENDPOINTS.psp.currencies());
        return normaliseCurrencies(res.data);
    },

    /** POST /requests/fetch-psp -> { requestId, psps[] }. */
    async fetchPsp(body: FetchPspRequest): Promise<FetchPspResponse> {
        const res = await apiClient.post<FetchPspResponse, FetchPspRequest>(
            API_ENDPOINTS.requests.fetchPsp(),
            body,
        );
        return res.data;
    },

    /** POST /transactions -> { txnId, sessionUrl }. */
    async createTransaction(body: CreateTransactionRequest): Promise<CreateTransactionResponse> {
        const res = await apiClient.post<CreateTransactionResponse, CreateTransactionRequest>(
            API_ENDPOINTS.transactions.create(),
            body,
        );
        return res.data;
    },
};
