import { useQueryClient } from "@tanstack/react-query";

export const useInvalidateCommonPSPQueries = () => {
	const queryClient = useQueryClient();

	return () => {
		const keys = [
			"currencies",
			"countries",
			"psp-details",
			"flowActions",
			"transaction-limits",
			"fees",
			"risk-rules",
		];
		for (const key of keys) {
			queryClient.removeQueries({ queryKey: [key], exact: false });
		}
	};
};

export const useInvalidateCommonRulesQueries = () => {
	const queryClient = useQueryClient();

	return () => {
		const keys = ["currencies", "countries", "flowActions"];
		for (const key of keys) {
			queryClient.removeQueries({ queryKey: [key], exact: false });
		}
	};
};
