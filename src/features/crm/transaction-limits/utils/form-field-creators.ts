import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { FlowAction } from "@/api/service.types";
import {
	createInputProps,
	createMultiSelectProps,
	createNumberInputProps,
	createSelectProps,
} from "@/hooks/use-common-form";

/**
 * Interface for form field options
 */
interface FormFieldOptions {
	currencies: Array<{ label: string; value: string }>;
	countries: Array<{ label: string; value: string }>;
	psps: Array<{ label: string; value: string }>;
	currenciesLoading: boolean;
	countriesLoading: boolean;
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
		label: t("transactionLimits.form.name.label"),
		placeholder: t("transactionLimits.form.name.placeholder"),
		required: true,
		tooltip: t("transactionLimits.form.tooltips.name"),
	});

	const currencyProps = createSelectProps(form, "currency" as Path<T>, {
		label: t("transactionLimits.form.currency.label"),
		placeholder: options.currenciesLoading
			? t("transactionLimits.form.currency.loadingPlaceholder")
			: t("transactionLimits.form.currency.placeholder"),
		required: true,
		selectOptions: options.currencies,
		tooltip: t("transactionLimits.form.tooltips.currency"),
	});

	const countriesProps = createMultiSelectProps(form, "countries" as Path<T>, {
		label: t("transactionLimits.form.countries.label"),
		placeholder: options.countriesLoading
			? t("transactionLimits.form.countries.loadingPlaceholder")
			: t("transactionLimits.form.countries.placeholder"),
		required: true,
		selectOptions: options.countries,
		showSearch: true,
		maxVisible: 4,
		tooltip: t("transactionLimits.form.tooltips.countries"),
	});

	const tagsProps = createMultiSelectProps(form, "tags" as Path<T>, {
		label: t("transactionLimits.form.tags.label"),
		placeholder: t("transactionLimits.form.tags.placeholder"),
		required: true,
		selectOptions: [
			{ label: t("transactionLimits.tags.banned"), value: "Banned" },
			{ label: t("transactionLimits.tags.vip"), value: "VIP" },
			{ label: t("transactionLimits.tags.important"), value: "Important" },
			{ label: t("transactionLimits.tags.premium"), value: "Premium" },
			{ label: t("transactionLimits.tags.standard"), value: "Standard" },
			{ label: t("transactionLimits.tags.newCustomer"), value: "New Customer" },
		],
		showSearch: true,
		maxVisible: 3,
		tooltip: t("transactionLimits.form.tooltips.tags"),
	});

	const pspsProps = createMultiSelectProps(form, "psps" as Path<T>, {
		label: t("transactionLimits.form.psps.label"),
		placeholder: t("transactionLimits.form.psps.placeholder"),
		required: true,
		selectOptions: options.psps,
		showSearch: true,
		maxVisible: 5,
		tooltip: t("transactionLimits.form.tooltips.psps"),
	});

	return {
		nameProps,
		currencyProps,
		countriesProps,
		tagsProps,
		pspsProps,
	};
};

/**
 * Creates form field props for flow action amount fields
 */
export const createFlowActionFieldProps = <T extends FieldValues>(
	form: UseFormReturn<T>,
	action: FlowAction,
	t: TranslationFunction,
) => {
	const fieldName = action.name.toLowerCase().replace(/\s+/g, "");
	const minFieldName = `${fieldName}MinAmount`;
	const maxFieldName = `${fieldName}MaxAmount`;

	const minProps = createNumberInputProps(form, minFieldName as Path<T>, {
		label: t("transactionLimits.form.amounts.minLabel", {
			actionName: action.name,
		}),
		placeholder: t("transactionLimits.form.amounts.minPlaceholder"),
		required: true,
		tooltip: t(`transactionLimits.form.tooltips.${fieldName}Min`),
		min: 0,
	});

	const maxProps = createNumberInputProps(form, maxFieldName as Path<T>, {
		label: t("transactionLimits.form.amounts.maxLabel", {
			actionName: action.name,
		}),
		placeholder: t("transactionLimits.form.amounts.maxPlaceholder"),
		required: true,
		tooltip: t(`transactionLimits.form.tooltips.${fieldName}Max`),
		min: 0,
	});

	// Override onChange handlers to trigger validation on both fields
	const originalMinOnChange = minProps.onChange;
	const originalMaxOnChange = maxProps.onChange;

	minProps.onChange = (value: string) => {
		originalMinOnChange(value);
		// Also trigger validation on the max field to clear any cross-field errors
		// form.trigger(maxFieldName as Path<T>);
	};

	maxProps.onChange = (value: string) => {
		originalMaxOnChange(value);
		// Also trigger validation on the min field to clear any cross-field errors
		// form.trigger(minFieldName as Path<T>);
	};

	return {
		minProps,
		maxProps,
		fieldName,
		minFieldName,
		maxFieldName,
	};
};

/**
 * Creates all flow action field props for the form
 */
export const createAllFlowActionFieldProps = <T extends FieldValues>(
	form: UseFormReturn<T>,
	flowActions: FlowAction[],
	t: TranslationFunction,
) => {
	return flowActions.map((action) => ({
		action,
		...createFlowActionFieldProps(form, action, t),
	}));
};
