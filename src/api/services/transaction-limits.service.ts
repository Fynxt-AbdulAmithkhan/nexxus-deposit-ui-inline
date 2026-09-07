import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { TransactionLimit, TransactionLimitCreateUpdate } from '../service.types';
import type { ApiResponse } from '../types';

/**
 * Transaction limits (CRM > Payment > Transaction Rule > Transaction limits).
 * Mirrors the CRM's TransactionLimitsService surface.
 */
export const TransactionLimitsService = {
    getTransactionLimits: (): Promise<ApiResponse<TransactionLimit[]>> =>
        apiClient.get<TransactionLimit[]>(API_ENDPOINTS.transactionLimits.list()),

    getTransactionLimitById: (id: number): Promise<ApiResponse<TransactionLimit>> =>
        apiClient.get<TransactionLimit>(API_ENDPOINTS.transactionLimits.byId(id)),

    createTransactionLimit: (
        payload: TransactionLimitCreateUpdate,
    ): Promise<ApiResponse<TransactionLimit>> =>
        apiClient.post<TransactionLimit, TransactionLimitCreateUpdate>(
            API_ENDPOINTS.transactionLimits.create(),
            payload,
        ),

    updateTransactionLimit: (
        id: number,
        payload: TransactionLimitCreateUpdate,
    ): Promise<ApiResponse<TransactionLimit>> =>
        apiClient.put<TransactionLimit, TransactionLimitCreateUpdate>(
            API_ENDPOINTS.transactionLimits.byId(id),
            payload,
        ),

    deleteTransactionLimit: (id: number): Promise<ApiResponse<unknown>> =>
        apiClient.delete<unknown>(API_ENDPOINTS.transactionLimits.byId(id)),
};
