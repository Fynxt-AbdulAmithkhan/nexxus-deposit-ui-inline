export const transactionLimitQueryKeys = {
	all: ["transaction-limits"] as const,
	lists: () => [...transactionLimitQueryKeys.all, "list"] as const,
	list: (brandId: string, environmentId: string) =>
		[...transactionLimitQueryKeys.lists(), brandId, environmentId] as const,
	details: () => [...transactionLimitQueryKeys.all, "detail"] as const,
	detail: (id: string) => [...transactionLimitQueryKeys.details(), id] as const,
} as const;
