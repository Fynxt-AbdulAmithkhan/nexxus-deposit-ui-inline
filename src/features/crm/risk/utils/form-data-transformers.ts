import type { FieldValues } from "react-hook-form";
import type {
	RiskRuleCreatePayload,
	RiskRuleUpdatePayload,
} from "@/api/service.types";

/**
 * Interface for form data
 */
interface FormData {
	name: string;
	type: "DEFAULT" | "CUSTOMER";
	action: "BLOCK" | "ALERT";
	currency: string;
	duration: "HOUR" | "DAY" | "WEEK" | "MONTH";
	maxAmount: number;
	flowActionId: string;
	status: "ENABLED" | "DISABLED";
	psps: string[]; // Form uses string array for simplicity
	criteriaType?: "TAG" | "ACCOUNT_TYPE";
	criteriaValue?: string[] | string;
}

/**
 * Transforms form data to API format
 * brandId and environmentId are automatically added via headers
 * @param data - Form data
 * @returns Transformed data in API format
 */
export const transformFormDataToAPI = (
	data: FormData,
): RiskRuleCreatePayload | RiskRuleUpdatePayload => {
	const baseData = {
		name: data.name,
		type: data.type,
		action: data.action,
		currency: data.currency,
		duration: data.duration,
		maxAmount: data.maxAmount,
		flowActionId: data.flowActionId,
		status: data.status,
		psps: data.psps.map((pspId: string) => ({ id: pspId })),
	};

	if (data.type === "DEFAULT") {
		return {
			...baseData,
			type: "DEFAULT",
		};
	}
	return {
		...baseData,
		type: "CUSTOMER",
		criteriaType: data.criteriaType || "TAG",
		criteriaValue: data.criteriaValue || "",
	};
};

/**
 * Populates form with initial data
 * @param form - React Hook Form instance
 * @param initialData - Initial form data
 */
export const populateFormWithInitialData = <T extends FieldValues>(
	form: { setValue: (name: keyof T, value: unknown) => void },
	initialData?: Partial<RiskRuleCreatePayload | RiskRuleUpdatePayload>,
) => {
	if (!initialData) {
		return;
	}

	// Set PSP values - convert from PSPResponse array to string array for form
	if (initialData.psps) {
		const pspIds = initialData.psps.map((psp) => psp.id);
		form.setValue("psps" as keyof T, pspIds);
	}

	// Set criteria values for CUSTOMER type
	if (initialData.type === "CUSTOMER" && initialData.criteriaValue) {
		form.setValue("criteriaValue" as keyof T, initialData.criteriaValue);
	}
};

// Re-export FieldValues type for convenience
export type { FieldValues } from "react-hook-form";
