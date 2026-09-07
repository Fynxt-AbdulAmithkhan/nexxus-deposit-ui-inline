import { z } from "zod";
import type { FlowAction } from "@/api/service.types";
import { createCommonSchemas } from "@/hooks/use-common-form";

/**
 * Type for translation function
 */
type TranslationFunction = (
	key: string,
	options?: Record<string, unknown>,
) => string;

/**
 * Creates a validation schema for transaction limit form
 * @param flowActions - Array of flow actions to create fields for
 * @param t - Translation function
 * @returns Zod schema for form validation
 */
export const createTransactionLimitSchema = (
	flowActions: FlowAction[],
	t: TranslationFunction,
) => {
	const commonSchemas = createCommonSchemas(t);

	const schemaFields: Record<string, z.ZodTypeAny> = {
		name: commonSchemas
			.requiredString(t("transactionLimits.validation.nameRequired"))
			.max(100, t("transactionLimits.validation.nameMaxLength")),
		currency: commonSchemas.currency(),
		countries: commonSchemas.country(),
		tags: z
			.array(z.string())
			.min(1, t("transactionLimits.validation.tagsRequired")),
		psps: commonSchemas.requiredArray(
			t("transactionLimits.validation.pspsRequired"),
		),
	};

	// Add dynamic fields for each flow action
	for (const action of flowActions) {
		const fieldName = action.name.toLowerCase().replace(/\s+/g, "");

		// Create base validation for min amount
		const minAmountSchema = createAmountSchema(
			t("transactionLimits.validation.minAmountPositive", {
				actionName: action.name,
			}),
		);

		// Create base validation for max amount
		const maxAmountSchema = createAmountSchema(
			t("transactionLimits.validation.maxAmountPositive", {
				actionName: action.name,
			}),
		);

		// All flow action fields are required by default
		schemaFields[`${fieldName}MinAmount`] = minAmountSchema.refine(
			(val) => val > 0,
			t("transactionLimits.validation.minAmountRequired", {
				actionName: action.name,
			}),
		);
		schemaFields[`${fieldName}MaxAmount`] = maxAmountSchema.refine(
			(val) => val > 0,
			t("transactionLimits.validation.maxAmountRequired", {
				actionName: action.name,
			}),
		);
	}

	// Add cross-field validation to ensure min <= max
	const baseSchema = z.object(schemaFields);

	return baseSchema.superRefine((data, ctx) => {
		validateMinMaxAmounts(data, flowActions, ctx, t);
	});
};

/**
 * Creates a base amount validation schema
 * @param fieldName - Name of the field for error messages
 * @returns Zod schema for amount validation
 */
const createAmountSchema = (fieldName: string) => {
	return z
		.union([z.string(), z.number()])
		.transform((val) => {
			if (typeof val === "string") {
				const num = Number.parseFloat(val);
				return Number.isNaN(num) ? 0 : num;
			}
			return val;
		})
		.refine((val) => val >= 0, `${fieldName}`);
};

/**
 * Validates that minimum amounts are less than or equal to maximum amounts
 * @param data - Form data
 * @param flowActions - Array of flow actions
 * @param ctx - Zod validation context
 * @param t - Translation function
 */
const validateMinMaxAmounts = (
	data: Record<string, unknown>,
	flowActions: FlowAction[],
	ctx: z.RefinementCtx,
	t: TranslationFunction,
) => {
	for (const action of flowActions) {
		const fieldName = action.name.toLowerCase().replace(/\s+/g, "");
		const minAmount = data[`${fieldName}MinAmount`] as number;
		const maxAmount = data[`${fieldName}MaxAmount`] as number;

		// Only validate if both values are defined and greater than 0
		if (
			typeof minAmount === "number" &&
			typeof maxAmount === "number" &&
			minAmount > 0 &&
			maxAmount > 0
		) {
			// Check if min equals max
			if (minAmount === maxAmount) {
				const errorMessage = t(
					"transactionLimits.validation.minMaxEqualValidation",
					{
						actionName: action.name,
					},
				);

				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: errorMessage,
					path: [`${fieldName}MinAmount`],
				});

				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: errorMessage,
					path: [`${fieldName}MaxAmount`],
				});
			}
			// Check if min > max
			else if (minAmount > maxAmount) {
				const errorMessage = t("transactionLimits.validation.minMaxValidation");

				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: errorMessage,
					path: [`${fieldName}MinAmount`],
				});

				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: errorMessage,
					path: [`${fieldName}MaxAmount`],
				});
			}
		}
	}
};

/**
 * Utility functions for different business rules to determine required actions
 */
export const FlowActionRequirementRules = {
	// Require all actions
	requireAll: (flowActions: FlowAction[]): string[] =>
		flowActions.map((action) => action.id),

	// Require actions by name pattern
	requireByNamePattern: (
		flowActions: FlowAction[],
		pattern: string,
	): string[] =>
		flowActions
			.filter((action) =>
				action.name.toLowerCase().includes(pattern.toLowerCase()),
			)
			.map((action) => action.id),

	// Require actions by specific IDs
	requireByIds: (flowActions: FlowAction[], ids: string[]): string[] =>
		flowActions
			.filter((action) => ids.includes(action.id))
			.map((action) => action.id),

	// Require first N actions
	requireFirstN: (flowActions: FlowAction[], count: number): string[] =>
		flowActions.slice(0, count).map((action) => action.id),

	// Require actions based on name length (example business rule)
	requireByMinNameLength: (
		flowActions: FlowAction[],
		minLength: number,
	): string[] =>
		flowActions
			.filter((action) => action.name.length >= minLength)
			.map((action) => action.id),
};
