export const routingRuleQueryKeys = {
	all: ["routing-rules"] as const,
	lists: () => [...routingRuleQueryKeys.all, "list"] as const,
	list: (brandId: string, environmentId: string) =>
		[...routingRuleQueryKeys.lists(), brandId, environmentId] as const,
	details: () => [...routingRuleQueryKeys.all, "detail"] as const,
	detail: (id: string) => [...routingRuleQueryKeys.details(), id] as const,
} as const;
