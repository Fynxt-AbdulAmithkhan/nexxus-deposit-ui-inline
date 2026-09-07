import type { Fee, FeeCreatePayload } from "../types";
import type { FeeFormSchema } from "../validation/fee.validation";

/**
 * Transform form data to API format
 * brandId and environmentId are automatically added via headers
 */
export const transformFormDataToAPI = (
	formData: FeeFormSchema,
): FeeCreatePayload => {
	return {
		name: formData.name,
		flowActionId: formData.flowActionId,
		currency: formData.currency,
		chargeFeeType: formData.chargeFeeType,
		status: formData.status,
		components: formData.components,
		countries: formData.countries,
		psps: formData.psps.map((pspId) => ({ id: pspId })),
	};
};

/**
 * Transform API data to form data
 */
export const transformAPIToFormData = (apiData: Fee): FeeFormSchema => {
	return {
		name: apiData.name,
		flowActionId: apiData.flowActionId,
		currency: apiData.currency || "",
		chargeFeeType: apiData.chargeFeeType,
		status: apiData.status,
		components: apiData.components.map((comp) => ({
			type: comp.type,
			amount: comp.amount,
			minValue: comp.minValue || 0,
			maxValue: comp.maxValue || 0,
		})),
		countries: Array.isArray(apiData.countries) ? apiData.countries : [],
		psps: Array.isArray(apiData.psps) ? apiData.psps.map((psp) => psp.id) : [],
	};
};
