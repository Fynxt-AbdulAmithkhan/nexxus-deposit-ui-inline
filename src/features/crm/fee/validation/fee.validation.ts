import type { TFunction } from "i18next";
import { z } from "zod";

// Component validation schema
const feeComponentSchema = z
	.object({
		type: z.enum(["FIXED", "PERCENTAGE"], {
			required_error: "Fee type is required",
		}),
		amount: z
			.number({
				required_error: "Amount is required",
				invalid_type_error: "Amount must be a number",
			})
			.min(0, "Amount must be greater than or equal to 0")
			.max(999_999_999, "Amount must be less than 999,999,999"),
		minValue: z
			.number({
				invalid_type_error: "Min value must be a number",
			})
			.min(0, "Min value must be greater than or equal to 0")
			.max(999_999_999, "Min value must be less than 999,999,999")
			.optional(),
		maxValue: z
			.number({
				invalid_type_error: "Max value must be a number",
			})
			.min(0, "Max value must be greater than or equal to 0")
			.max(999_999_999, "Max value must be less than 999,999,999")
			.optional(),
	})
	.refine(
		(data) => {
			// If both min and max are set, max must be greater than min
			if (
				data.minValue &&
				data.maxValue &&
				data.minValue > 0 &&
				data.maxValue > 0
			) {
				return data.maxValue > data.minValue;
			}
			return true;
		},
		{
			message: "Max value must be greater than min value",
			path: ["maxValue"],
		},
	)
	.refine(
		(data) => {
			// For PERCENTAGE type, amount should be between 0 and 100
			if (data.type === "PERCENTAGE") {
				return data.amount >= 0 && data.amount <= 100;
			}
			return true;
		},
		{
			message: "Percentage amount must be between 0 and 100",
			path: ["amount"],
		},
	);

/**
 * Fee form validation schema
 */
export const createFeeSchema = (t: TFunction) => {
	return z.object({
		name: z
			.string()
			.min(1, t("fees.validation.nameRequired"))
			.max(100, t("fees.validation.nameMaxLength")),
		flowActionId: z.string().min(1, t("fees.validation.actionRequired")),
		currency: z.string().min(1, t("fees.validation.currencyRequired")),
		chargeFeeType: z.enum(["INCLUSIVE", "EXCLUSIVE"], {
			required_error: t("fees.validation.chargeFeeTypeRequired"),
		}),
		status: z.enum(["ENABLED", "DISABLED"]),
		components: z
			.array(feeComponentSchema)
			.min(1, t("fees.validation.componentsRequired"))
			.max(10, t("fees.validation.componentsMaxLength")),
		countries: z
			.array(z.string())
			.min(1, t("fees.validation.countriesRequired"))
			.max(50, t("fees.validation.countriesMaxLength")),
		psps: z
			.array(z.string())
			.min(1, t("fees.validation.pspsRequired"))
			.max(20, t("fees.validation.pspsMaxLength")),
	});
};

export type FeeFormSchema = z.infer<ReturnType<typeof createFeeSchema>>;
