import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { PSPService } from "@/api/services";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { validatePSP } from "../form-helpers";

interface UsePSPManagementProps {
	setPspErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
	priorityPsps: Array<{ id: string; pspId: string }>;
}

export const usePSPManagement = ({
	setPspErrors,
	priorityPsps,
}: UsePSPManagementProps) => {
	const { selectedBrand, selectedEnvironment, isReady } = useBrandEnvironment();

	// Fetch PSPs for the selected brand and environment
	const { data: pspsData } = useQuery({
		queryKey: ["configured-psps", selectedBrand?.id, selectedEnvironment?.id],
		queryFn: () => {
			const brandId = selectedBrand?.id;
			const environmentId = selectedEnvironment?.id;
			if (!(brandId && environmentId)) {
				throw new Error("Brand or environment not selected");
			}
			return PSPService.getConfiguredPSPs();
		},
		enabled: isReady,
		select: (data) => data?.data || [],
	});

	// PSP options from API data
	const pspOptions = useMemo(() => {
		if (!Array.isArray(pspsData)) {
			return [];
		}
		return pspsData.map((psp) => ({
			label: psp.name || psp.id,
			value: psp.id,
		}));
	}, [pspsData]);

	// Validation function for PSPs
	const validatePSPWrapper = useCallback(
		(pspId: string, currentId: string) => {
			return validatePSP(pspId, currentId, priorityPsps, setPspErrors);
		},
		[priorityPsps, setPspErrors],
	);

	return {
		pspOptions,
		validatePSP: validatePSPWrapper,
		selectedBrand,
		selectedEnvironment,
	};
};
