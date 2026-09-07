import { z } from "zod";
import { createCommonSchemas } from "@/hooks/use-common-form";

/**
 * Type for translation function
 */
type TranslationFunction = (
	key: string,
	options?: Record<string, unknown>,
) => string;

/**
 * Creates a validation schema for risk rule form
 * @param t - Translation function
 * @returns Zod schema for form validation
 */
export const createRiskRuleSchema = (t: TranslationFunction) => {
	const commonSchemas = createCommonSchemas(t);

	return z
		.object({
			name: commonSchemas
				.requiredString(t("riskRules.validation.nameRequired"))
				.max(100, t("riskRules.validation.nameMaxLength")),
			type: z.enum(["DEFAULT", "CUSTOMER"], {
				required_error: t("riskRules.validation.typeRequired"),
			}),
			action: z.enum(["BLOCK", "ALERT"], {
				required_error: t("riskRules.validation.actionRequired"),
			}),
			currency: commonSchemas.currency(),
			duration: z.enum(["HOUR", "DAY", "WEEK", "MONTH"], {
				required_error: t("riskRules.validation.durationRequired"),
			}),
			maxAmount: z
				.union([z.string(), z.number()])
				.transform((val) => {
					if (typeof val === "string") {
						const num = Number.parseFloat(val);
						return Number.isNaN(num) ? 0 : num;
					}
					return val;
				})
				.refine((val) => val >= 0, t("riskRules.validation.maxAmountPositive"))
				.refine((val) => val > 0, t("riskRules.validation.maxAmountRequired")),
			flowActionId: commonSchemas.requiredString(
				t("riskRules.validation.flowActionRequired"),
			),
			status: z.enum(["ENABLED", "DISABLED"], {
				required_error: t("riskRules.validation.statusRequired"),
			}),
			psps: commonSchemas.requiredArray(t("riskRules.validation.pspsRequired")), // PSP IDs as string array
			// Conditional fields for CUSTOMER type
			criteriaType: z.enum(["TAG", "ACCOUNT_TYPE"]).optional(),
			criteriaValue: z.array(z.string()).or(z.string()).optional(),
		})
		.refine(
			(data) => {
				// For CUSTOMER type, criteriaType and criteriaValue are required
				if (data.type === "CUSTOMER") {
					return (
						data.criteriaType &&
						data.criteriaValue &&
						data.criteriaValue.length > 0
					);
				}
				return true;
			},
			{
				message: t("riskRules.validation.criteriaRequired"),
				path: ["criteriaType"],
			},
		);
};

/**
 * Validation messages for risk rules
 */
export const RiskRuleValidationMessages = {
	nameRequired: "Name is required",
	nameMaxLength: "Name must be less than 100 characters",
	typeRequired: "Type is required",
	actionRequired: "Action is required",
	currencyRequired: "Currency is required",
	durationRequired: "Duration is required",
	maxAmountPositive: "Max amount must be positive",
	maxAmountRequired: "Max amount is required",
	flowActionRequired: "Flow action is required",
	statusRequired: "Status is required",
	pspsRequired: "At least one PSP is required",
	criteriaRequired: "Criteria type and values are required for CUSTOMER type",
};
