// Re-export types from service.types.ts
export type {
	Fee,
	FeeComponent,
	FeeCreatePayload,
	FeeUpdatePayload,
} from "@/api/service.types";

export interface PSP {
	id: string;
	name: string;
}

export interface FeeFormData {
	name: string;
	currency: string;
	chargeFeeType: "INCLUSIVE" | "EXCLUSIVE";
	status: "ENABLED" | "DISABLED";
	flowActionId: string;
	components: Array<{
		type: "FIXED" | "PERCENTAGE";
		amount: number;
		minValue?: number;
		maxValue?: number;
	}>;
	countries: string[];
	psps: string[];
}

export interface FeeFormProps {
	initialData?: Partial<FeeFormData>;
	onSubmit: (data: FeeFormData) => void;
	mode: "create" | "edit";
	formId: string;
}

export const COMPONENT_TYPES = ["FIXED", "PERCENTAGE"] as const;

export const CHARGE_FEE_TYPES = ["INCLUSIVE", "EXCLUSIVE"] as const;

export const FEE_STATUS = ["ENABLED", "DISABLED"] as const;
