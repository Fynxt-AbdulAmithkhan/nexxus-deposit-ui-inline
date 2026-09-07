import type {
	RiskRuleCreatePayload,
	RiskRuleUpdatePayload,
} from "@/api/service.types";

export interface RiskRuleModalProps {
	isOpen: boolean;
	onClose: () => void;
	riskRuleId?: number; // If provided, edit mode; if not, create mode (Integer from database)
}
/**
 * Interface for basic field props
 */
export interface BasicFieldProps {
	nameProps: Record<string, unknown>;
	typeProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	actionProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	currencyProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	durationProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	maxAmountProps: Record<string, unknown>;
	flowActionProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	statusProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	pspsProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
}

/**
 * Interface for criteria field props
 */
interface CriteriaFieldProps {
	criteriaTypeProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	criteriaValueProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
}

/**
 * Props for BasicInformationSection component
 */
export interface BasicInformationSectionProps {
	fieldProps: BasicFieldProps;
}

/**
 * Props for RiskCriteriaSection component
 */
export interface RiskCriteriaSectionProps {
	criteriaFieldProps: CriteriaFieldProps;
	getAvailableCriteriaValues: () => Array<{ label: string; value: string }>;
	isVisible: boolean;
}

/**
 * Props for PSPConfigurationSection component
 */
export interface PSPConfigurationSectionProps {
	pspsProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
}

/**
 * Props for RiskRuleModalFormRefactored component
 */
export interface RiskRuleModalFormProps extends RiskRuleFormProps {}
/**
 * Risk Rule Types
 * Centralized type definitions for risk rule components
 */

// PSP structure for API responses (when fetching data)
export interface RiskRulePSPResponse {
	id: string;
	name: string;
}

// PSP structure for API requests (when creating/updating)
export interface RiskRulePSPRequest {
	id: string;
}

// API payload interface for risk rule creation/updating

// Form props interface
export interface RiskRuleFormProps {
	initialData?: Partial<RiskRuleCreatePayload | RiskRuleUpdatePayload>;
	onSubmit: (data: RiskRuleCreatePayload | RiskRuleUpdatePayload) => void;
	mode: "create" | "edit";
	formId: string;
}
