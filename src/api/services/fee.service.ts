import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { Fee, FeeCreatePayload, FeeUpdatePayload } from '../service.types';
import type { ApiResponse } from '../types';

/**
 * Fee rules (CRM > Payment > Transaction Rule > Fees management).
 *
 * Same surface as the CRM's FeeService so the copied screens run unmodified. Brand and
 * environment are resolved server-side from the x-secret-token, so no id is sent.
 */
export const FeeService = {
    getFees: (): Promise<ApiResponse<Fee[]>> => apiClient.get<Fee[]>(API_ENDPOINTS.fees.list()),

    getFeeById: (feeId: number): Promise<ApiResponse<Fee>> =>
        apiClient.get<Fee>(API_ENDPOINTS.fees.byId(feeId)),

    createFee: (feeData: FeeCreatePayload): Promise<ApiResponse<Fee>> =>
        apiClient.post<Fee, FeeCreatePayload>(API_ENDPOINTS.fees.create(), feeData),

    updateFee: (feeId: number, feeData: FeeUpdatePayload): Promise<ApiResponse<Fee>> =>
        apiClient.put<Fee, FeeUpdatePayload>(API_ENDPOINTS.fees.byId(feeId), feeData),

    deleteFee: (feeId: number): Promise<ApiResponse<unknown>> =>
        apiClient.delete<unknown>(API_ENDPOINTS.fees.byId(feeId)),
};
