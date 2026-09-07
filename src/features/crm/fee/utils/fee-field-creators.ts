import type { TFunction } from "i18next";
import type { UseFormReturn } from "react-hook-form";
import type { FlowAction, PSP } from "@/api/service.types";
import {
	createInputProps,
	createMultiSelectProps,
	createSelectProps,
} from "@/hooks/use-common-form";
import { CHARGE_FEE_TYPES } from "../types";
import type { FeeFormSchema } from "../validation/fee.validation";

interface FeeDataOptions {
	currencies: string[];
	countries: string[];
	flowActions: FlowAction[];
	psps: PSP[];
	currenciesLoading: boolean;
	countriesLoading: boolean;
	flowActionsLoading: boolean;
	pspsLoading: boolean;
	currenciesError: boolean;
	countriesError: boolean;
	flowActionsError: boolean;
	pspsError: boolean;
}

/**
 * Create field props for fee form
 */
export const createFeeFieldProps = (
	form: UseFormReturn<FeeFormSchema>,
	options: FeeDataOptions,
	t: TFunction,
) => {
	const {
		currencies,
		countries,
		flowActions,
		psps,
		currenciesLoading,
		countriesLoading,
		flowActionsLoading,
		pspsLoading,
		currenciesError,
		countriesError,
		flowActionsError,
		pspsError,
	} = options;

	// Get current form values to check if action and currency are selected
	const flowActionId = form.watch("flowActionId");
	const formCurrency = form.watch("currency");

	// PSP field should be disabled if action or currency is not selected
	const hasRequiredFields = Boolean(flowActionId && formCurrency);
	const isPSPFieldDisabled = !hasRequiredFields || pspsLoading || pspsError;

	return {
		nameProps: createInputProps(form, "name", {
			label: t("fees.form.name.label"),
			placeholder: t("fees.form.name.placeholder"),
			required: true,
			tooltip: t("fees.form.tooltips.name"),
		}),

		flowActionProps: createSelectProps(form, "flowActionId", {
			label: t("fees.form.action.label"),
			placeholder: flowActionsLoading
				? t("fees.form.action.loading")
				: t("fees.form.action.placeholder"),
			required: true,
			tooltip: t("fees.form.tooltips.action"),
			selectOptions: flowActions.map((action) => ({
				label: action.name,
				value: action.id,
			})),
			isDisabled: flowActionsLoading || flowActionsError,
		}),

		currencyProps: createSelectProps(form, "currency", {
			label: t("fees.form.currency.label"),
			placeholder: currenciesLoading
				? t("fees.form.currency.loading")
				: t("fees.form.currency.placeholder"),
			required: true,
			tooltip: t("fees.form.tooltips.currency"),
			selectOptions: currencies.map((currency) => ({
				label: currency,
				value: currency,
			})),
			isDisabled: currenciesLoading || currenciesError,
		}),

		chargeFeeTypeProps: createSelectProps(form, "chargeFeeType", {
			label: t("fees.form.chargeFeeType.label"),
			placeholder: t("fees.form.chargeFeeType.placeholder"),
			required: true,
			tooltip: t("fees.form.tooltips.chargeFeeType"),
			selectOptions: CHARGE_FEE_TYPES.map((type) => ({
				label: type,
				value: type,
			})),
		}),

		countriesProps: createMultiSelectProps(form, "countries", {
			label: t("fees.form.countries.label"),
			placeholder: countriesLoading
				? t("fees.form.countries.loading")
				: t("fees.form.countries.placeholder"),
			required: true,
			tooltip: t("fees.form.tooltips.countries"),
			selectOptions: countries.map((country) => ({
				label: country,
				value: country,
			})),
			maxVisible: 4,
			isDisabled: countriesLoading || countriesError,
		}),

		pspsProps: (() => {
			let placeholder: string;

			if (!hasRequiredFields) {
				placeholder = t("fees.form.psps.selectActionAndCurrencyFirst");
			} else if (pspsLoading) {
				placeholder = t("fees.form.psps.loading");
			} else {
				placeholder = t("fees.form.psps.placeholder");
			}

			return createMultiSelectProps(form, "psps", {
				label: t("fees.form.psps.label"),
				placeholder,
				required: true,
				tooltip: t("fees.form.tooltips.psps"),
				selectOptions: psps.map((psp) => ({
					label: psp.name,
					value: psp.id,
				})),
				maxVisible: 3,
				isDisabled: isPSPFieldDisabled,
			});
		})(),

		// Loading states
		isLoadingCurrencies: currenciesLoading,
		isLoadingCountries: countriesLoading,
		isLoadingFlowActions: flowActionsLoading,
		isLoadingPSPs: pspsLoading,

		// Error states
		hasCurrenciesError: currenciesError,
		hasCountriesError: countriesError,
		hasFlowActionsError: flowActionsError,
		hasPSPsError: pspsError,
	};
};
