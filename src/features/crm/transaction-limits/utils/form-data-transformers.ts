import type { FieldValues } from "react-hook-form";
import type { FlowAction } from "@/api/service.types";
import type { PSPRequest, TransactionLimitFormData } from "../types";

/**
 * Interface for form data
 */
interface FormData {
	name: string;
	currency: string;
	countries: string[];
	tags: string[];
	psps: string[]; // Form still uses string array for simplicity
	[key: string]: unknown; // For dynamic flow action fields
}

/**
 * Transforms form data to API format
 * brandId and environmentId are automatically added via headers
 * @param data - Form data
 * @param flowActions - Array of flow actions
 * @returns Transformed data in API format
 */
export const transformFormDataToAPI = (
	data: FormData,
	flowActions: FlowAction[],
): TransactionLimitFormData => {
	const pspActions = flowActions.map((action) => {
		const fieldName = action.name.toLowerCase().replace(/\s+/g, "");
		return {
			flowActionId: action.id,
			minAmount: (data[`${fieldName}MinAmount`] as number) || 10,
			maxAmount: (data[`${fieldName}MaxAmount`] as number) || 100,
		};
	});

	return {
		name: data.name,
		currency: data.currency,
		countries: data.countries,
		customerTags: data.tags,
		psps: data.psps.map((pspId: string): PSPRequest => ({ id: pspId })),
		status: "ENABLED", // Default to enabled
		pspActions,
	};
};

/**
 * Populates form with initial data
 * @param form - React Hook Form instance
 * @param flowActions - Array of flow actions
 * @param initialData - Initial form data
 */
export const populateFormWithInitialData = <T extends FieldValues>(
	form: { setValue: (name: keyof T, value: unknown) => void },
	flowActions: FlowAction[],
	initialData?: Partial<TransactionLimitFormData>,
) => {
	if (!(flowActions.length && initialData?.pspActions)) {
		return;
	}

	// Set PSP values - convert from PSPRequest array to string array for form
	if (initialData.psps) {
		const pspIds = initialData.psps.map((psp) => psp.id);
		form.setValue("psps" as keyof T, pspIds);
	}

	for (const action of flowActions) {
		const fieldName = action.name.toLowerCase().replace(/\s+/g, "");
		const matchingPspAction = initialData.pspActions?.find(
			(pspAction) => pspAction.flowActionId === action.id,
		);

		if (matchingPspAction) {
			form.setValue(
				`${fieldName}MinAmount` as keyof T,
				matchingPspAction.minAmount,
			);
			form.setValue(
				`${fieldName}MaxAmount` as keyof T,
				matchingPspAction.maxAmount,
			);
		}
	}
};

// Re-export FieldValues type for convenience
export type { FieldValues } from "react-hook-form";
