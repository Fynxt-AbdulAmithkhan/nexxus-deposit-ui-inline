import { useQuery } from "@tanstack/react-query";
import { FlowActionService, PSPService, RiskService } from "@/api/services";
import { riskQueryKeys } from "../helpers/query-keys";

/**
 * Hook to fetch currencies for a specific brand and environment
 */
export const useCurrenciesQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["currencies", brandId, environmentId],
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return PSPService.getCurrencies();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data.map((currency) => ({
				label: currency,
				value: currency,
			}));
		},
		enabled: !!(brandId && environmentId) && isReady,
	});
};

/**
 * Hook to fetch flow actions for a specific flow type
 */
export const useFlowActionsQuery = (flowTypeId?: string) => {
	return useQuery({
		queryKey: ["flowActions", flowTypeId],
		queryFn: () => {
			if (!flowTypeId) {
				throw new Error("Flow type must be selected");
			}
			return FlowActionService.getFlowActions(flowTypeId);
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!flowTypeId,
	});
};

/**
 * Hook to fetch PSPs for a specific brand, environment, action, and currency
 */
export const usePSPsQuery = (
	brandId?: string,
	environmentId?: string,
	actionId?: string,
	currency?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["psps", brandId, environmentId, actionId, currency],
		queryFn: () => {
			if (!(brandId && environmentId && actionId && currency)) {
				throw new Error(
					"Brand, environment, action, and currency must be selected",
				);
			}
			return PSPService.getPSPsByActionAndCurrency(actionId, currency);
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data.map((psp) => ({
				label: psp.name,
				value: psp.id,
			}));
		},
		enabled: !!(brandId && environmentId && actionId && currency) && isReady,
	});
};

/**
 * Hook to fetch risk rules for a specific brand and environment
 */
export const useRiskRulesQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: riskQueryKeys.list(brandId || "", environmentId || ""),
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return RiskService.getRiskRules();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!(brandId && environmentId) && isReady,
	});
};

/**
 * Hook to fetch a single risk rule by ID
 */
export const useRiskRuleQuery = (riskRuleId?: number) => {
	return useQuery({
		queryKey: riskQueryKeys.detail(riskRuleId ? String(riskRuleId) : ""),
		queryFn: () => {
			if (!riskRuleId) {
				throw new Error("Risk rule ID is required");
			}
			return RiskService.getRiskRuleById(riskRuleId);
		},
		select: (data) => data?.data,
		enabled: !!riskRuleId,
		staleTime: 0, // Always fetch fresh data for edit mode
		gcTime: 0, // Don't cache this data to prevent stale data issues
	});
};
