import { useQuery } from "@tanstack/react-query";
import { PSPService } from "@/api/services";
import { FlowActionService } from "@/api/services/flow.service";
import { TransactionLimitsService } from "@/api/services/transaction-limits.service";
import { transactionLimitQueryKeys } from "../helpers/query-keys";

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
 * Hook to fetch countries for a specific brand and environment
 */
export const useCountriesQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["countries", brandId, environmentId],
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return PSPService.getCountries();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data.map((country) => ({
				label: country,
				value: country,
			}));
		},
		enabled: !!(brandId && environmentId) && isReady,
	});
};

/**
 * Hook to fetch PSPs for a specific brand and environment
 */
export const usePSPsQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["psps", brandId, environmentId],
		queryFn: () => PSPService.getConfiguredPSPs(),
		select: (data) =>
			data.data?.map((psp) => ({
				label: psp.name,
				value: psp.id,
			})) || [],
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
 * Hook to fetch transaction limits for a specific brand and environment
 */
export const useTransactionLimitsQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: transactionLimitQueryKeys.list(
			brandId || "",
			environmentId || "",
		),
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return TransactionLimitsService.getTransactionLimits();
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
 * Hook to fetch a single transaction limit by ID
 */
export const useTransactionLimitQuery = (limitId?: number) => {
	return useQuery({
		queryKey: transactionLimitQueryKeys.detail(limitId ? String(limitId) : ""),
		queryFn: () => {
			if (!limitId) {
				throw new Error("Transaction limit ID is required");
			}
			return TransactionLimitsService.getTransactionLimitById(limitId);
		},
		select: (data) => data?.data,
		enabled: !!limitId,
		staleTime: 0, // Always fetch fresh data for edit mode
		gcTime: 0, // Don't cache this data to prevent stale data issues
	});
};
