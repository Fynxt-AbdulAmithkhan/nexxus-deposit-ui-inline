/**
 * Query keys factory for better cache management
 */
export const feeQueryKeys = {
	all: ["fees"] as const,

	// Fees query key
	list: (brandId: string, environmentId: string) =>
		[...feeQueryKeys.all, "list", brandId, environmentId] as const,

	// Fee by ID query key
	detail: (feeId: string) => [...feeQueryKeys.all, "detail", feeId] as const,
};
