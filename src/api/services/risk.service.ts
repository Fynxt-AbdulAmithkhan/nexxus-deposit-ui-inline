import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
import type { RiskRule, RiskRuleCreatePayload, RiskRuleUpdatePayload } from '../service.types';
import type { ApiResponse } from '../types';

/**
 * Risk rules (CRM > Payment > Transaction Rule > Risk Management).
 * Mirrors the CRM's RiskService surface; brand and environment come from headers.
 */
export const RiskService = {
    getRiskRules: (): Promise<ApiResponse<RiskRule[]>> =>
        apiClient.get<RiskRule[]>(API_ENDPOINTS.riskRules.list()),

    getRiskRuleById: (riskRuleId: number): Promise<ApiResponse<RiskRule>> =>
        apiClient.get<RiskRule>(API_ENDPOINTS.riskRules.byId(riskRuleId)),

    createRiskRule: (riskRuleData: RiskRuleCreatePayload): Promise<ApiResponse<RiskRule>> =>
        apiClient.post<RiskRule, RiskRuleCreatePayload>(
            API_ENDPOINTS.riskRules.create(),
            riskRuleData,
        ),

    updateRiskRule: (
        riskRuleId: number,
        riskRuleData: RiskRuleUpdatePayload,
    ): Promise<ApiResponse<RiskRule>> =>
        apiClient.put<RiskRule, RiskRuleUpdatePayload>(
            API_ENDPOINTS.riskRules.byId(riskRuleId),
            riskRuleData,
        ),

    deleteRiskRule: (riskRuleId: number): Promise<ApiResponse<unknown>> =>
        apiClient.delete<unknown>(API_ENDPOINTS.riskRules.byId(riskRuleId)),
};
