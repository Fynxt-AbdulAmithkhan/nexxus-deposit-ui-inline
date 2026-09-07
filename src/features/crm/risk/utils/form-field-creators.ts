import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import {
	createInputProps,
	createMultiSelectProps,
	createSelectProps,
} from "@/hooks/use-common-form";

/**
 * Interface for form field options
 */
interface FormFieldOptions {
	currencies: Array<{ label: string; value: string }>;
	flowActions: Array<{ label: string; value: string }>;
	psps: Array<{ label: string; value: string }>;
	currenciesLoading: boolean;
	flowActionsLoading: boolean;
	pspsLoading: boolean;
}

/**
 * Type for translation function
 */
type TranslationFunction = (
	key: string,
	options?: Record<string, unknown>,
) => string;

/**
 * Creates all basic form field props
 */
export const createBasicFieldProps = <T extends FieldValues>(
	form: UseFormReturn<T>,
	options: FormFieldOptions,
	t: TranslationFunction,
) => {
	const nameProps = createInputProps(form, "name" as Path<T>, {
		label: t("riskRules.form.name.label"),
		placeholder: t("riskRules.form.name.placeholder"),
		required: true,
		tooltip: t("riskRules.form.tooltips.name"),
	});

	const typeProps = createSelectProps(form, "type" as Path<T>, {
		label: "Type",
		placeholder: "Select Type",
		required: true,
		selectOptions: [
			{ label: "Default", value: "DEFAULT" },
			{ label: "Customers", value: "CUSTOMER" },
		],
		tooltip: "Select the type of risk rule",
	});

	const actionProps = createSelectProps(form, "action" as Path<T>, {
		label: "Action",
		placeholder: "Select Rule Action",
		required: true,
		selectOptions: [
			{ label: "Block Transaction", value: "BLOCK" },
			{ label: "Send Alert", value: "ALERT" },
		],
		tooltip: "Select the rule action",
	});

	const currencyProps = createSelectProps(form, "currency" as Path<T>, {
		label: "Currency",
		placeholder: options.currenciesLoading
			? "Loading currencies..."
			: "Select Currency",
		required: true,
		selectOptions: options.currencies,
		tooltip: "Select the currency",
	});

	const durationProps = createSelectProps(form, "duration" as Path<T>, {
		label: "Duration",
		placeholder: "Select Duration",
		required: true,
		selectOptions: [
			{ label: "Hourly", value: "HOUR" },
			{ label: "Daily", value: "DAY" },
			{ label: "Weekly", value: "WEEK" },
			{ label: "Monthly", value: "MONTH" },
		],
		tooltip: "Select the duration",
	});

	const maxAmountProps = createInputProps(form, "maxAmount" as Path<T>, {
		label: "Max Amount",
		placeholder: "Enter max amount",
		required: true,
		type: "number",
		tooltip: "Enter the maximum amount",
	});

	const flowActionProps = createSelectProps(form, "flowActionId" as Path<T>, {
		label: "Rule Action",
		placeholder: options.flowActionsLoading
			? "Loading actions..."
			: "Select Rule Action",
		required: true,
		selectOptions: options.flowActions,
		tooltip: "Select the action",
	});

	const statusProps = createSelectProps(form, "status" as Path<T>, {
		label: "Status",
		placeholder: "Select Status",
		required: true,
		selectOptions: [
			{ label: "Enabled", value: "ENABLED" },
			{ label: "Disabled", value: "DISABLED" },
		],
		tooltip: "Select the status",
	});

	const pspsProps = createMultiSelectProps(form, "psps" as Path<T>, {
		label: "PSP",
		placeholder: options.pspsLoading ? "Loading PSPs..." : "Select PSPs",
		required: true,
		selectOptions: options.psps,
		showSearch: true,
		maxVisible: 5,
		tooltip: "Select Payment Service Providers",
	});

	return {
		nameProps,
		typeProps,
		actionProps,
		currencyProps,
		durationProps,
		maxAmountProps,
		flowActionProps,
		statusProps,
		pspsProps,
	};
};

/**
 * Creates criteria field props for CUSTOMER type
 */
export const createCriteriaFieldProps = <T extends FieldValues>(
	form: UseFormReturn<T>,
) => {
	const criteriaTypeProps = createSelectProps(form, "criteriaType" as Path<T>, {
		label: "Criteria",
		placeholder: "Select Criteria",
		required: true,
		selectOptions: [
			{ label: "Tags", value: "TAG" },
			{ label: "Account Type", value: "ACCOUNT_TYPE" },
		],
		tooltip: "Select the criteria type",
	});

	const criteriaValueProps = createMultiSelectProps(
		form,
		"criteriaValue" as Path<T>,
		{
			label: "Criteria Value",
			placeholder: "Select Tags",
			required: true,
			selectOptions: [], // Will be populated based on criteriaType
			maxVisible: 3,
			tooltip: "Select the tags",
		},
	);

	return {
		criteriaTypeProps,
		criteriaValueProps,
	};
};
