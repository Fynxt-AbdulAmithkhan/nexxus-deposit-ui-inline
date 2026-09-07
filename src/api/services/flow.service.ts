import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { FlowAction } from '../service.types';
import type { ApiResponse } from '../types';

/** Shape returned by GET /flow-types (only the fields the rule forms use). */
export interface FlowType {
    id: string;
    name?: string;
    description?: string;
}

export const FlowTypeService = {
    getFlowTypes: (): Promise<ApiResponse<FlowType[]>> =>
        apiClient.get<FlowType[]>(API_ENDPOINTS.flowTypes.list()),
};

export const FlowActionService = {
    /** Flow actions for a flow type — the "deposit"/"withdrawal" options on a rule. */
    getFlowActions: (flowTypeId: string): Promise<ApiResponse<FlowAction[]>> =>
        apiClient.get<FlowAction[]>(API_ENDPOINTS.flowActions.listByFlowType(flowTypeId)),
};
