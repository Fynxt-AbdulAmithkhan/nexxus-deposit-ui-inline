import { apiClient } from '../api-client';
import { API_ENDPOINTS } from '../endpoints';
// Types come from the routing screen, not service.types — the same split the CRM uses.
// service.types has its own RoutingRule with a numeric id, which does not match the shape
// this screen is built against.
import type {
    RoutingRule,
    RoutingRuleCreatePayload,
    RoutingRuleUpdatePayload,
} from '@/features/crm/routing/types';
import type { ApiResponse } from '../types';

/**
 * Routing rules (CRM > Payment > Transaction Rule > Routing Rules).
 * Mirrors the CRM's RoutingRulesService surface.
 */
export const RoutingRulesService = {
    getRoutingRules: (): Promise<ApiResponse<RoutingRule[]>> =>
        apiClient.get<RoutingRule[]>(API_ENDPOINTS.routingRules.list()),

    getRoutingRuleById: (routingRuleId: number): Promise<ApiResponse<RoutingRule>> =>
        apiClient.get<RoutingRule>(API_ENDPOINTS.routingRules.byId(routingRuleId)),

    createRoutingRule: (
        routingRuleData: RoutingRuleCreatePayload,
    ): Promise<ApiResponse<RoutingRule>> =>
        apiClient.post<RoutingRule, RoutingRuleCreatePayload>(
            API_ENDPOINTS.routingRules.create(),
            routingRuleData,
        ),

    updateRoutingRule: (
        routingRuleId: number,
        routingRuleData: RoutingRuleUpdatePayload,
    ): Promise<ApiResponse<RoutingRule>> =>
        apiClient.put<RoutingRule, RoutingRuleUpdatePayload>(
            API_ENDPOINTS.routingRules.byId(routingRuleId),
            routingRuleData,
        ),

    deleteRoutingRule: (routingRuleId: number): Promise<ApiResponse<void>> =>
        apiClient.delete<void>(API_ENDPOINTS.routingRules.byId(routingRuleId)),
};
