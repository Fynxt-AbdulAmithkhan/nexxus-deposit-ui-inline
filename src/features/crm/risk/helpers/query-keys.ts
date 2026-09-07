/**
 * Query keys factory for better cache management
 */
export const riskQueryKeys = {
	all: ["riskRules"] as const,

	// Risk rules query key
	list: (brandId: string, environmentId: string) =>
		[...riskQueryKeys.all, "list", brandId, environmentId] as const,

	// Risk rule by ID query key
	detail: (riskRuleId: string) =>
		[...riskQueryKeys.all, "detail", riskRuleId] as const,
};
