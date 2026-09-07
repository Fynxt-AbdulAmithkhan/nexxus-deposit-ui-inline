import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFlowType } from "@/hooks";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import {
	createFormSubmitHandler,
	useCommonForm,
} from "@/hooks/use-common-form";
import type { TransactionLimitFormData } from "../types";
import {
	populateFormWithInitialData,
	transformFormDataToAPI,
} from "../utils/form-data-transformers";
import {
	createAllFlowActionFieldProps,
	createBasicFieldProps,
} from "../utils/form-field-creators";
import { createTransactionLimitSchema } from "../validation/transaction-limit.validation";
import {
	useCountriesQuery,
	useCurrenciesQuery,
	useFlowActionsQuery,
	usePSPsQuery,
} from "./use-transaction-limit-queries";

/**
 * Interface for form props
 */
interface UseTransactionLimitFormProps {
	initialData?: Partial<TransactionLimitFormData>;
	onSubmit: (data: TransactionLimitFormData) => void;
}

/**
 * Custom hook for transaction limit form logic
 */
export const useTransactionLimitForm = ({
	initialData,
	onSubmit,
}: UseTransactionLimitFormProps) => {
	const { t } = useTranslation();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();

	// Fetch data queries
	const currenciesQuery = useCurrenciesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
	);
	const countriesQuery = useCountriesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
	);
	const pspsQuery = usePSPsQuery(selectedBrand?.id, selectedEnvironment?.id);
	const { selectedFlowType } = useFlowType();
	const flowActionsQuery = useFlowActionsQuery(selectedFlowType?.id);

	// Create dynamic schema based on flow actions
	const transactionLimitSchema = createTransactionLimitSchema(
		flowActionsQuery.data || [],
		t,
	);

	// Memoize default values to prevent unnecessary re-renders
	const defaultValues = useMemo(() => {
		console.log("initialData", initialData);

		return {
			name: initialData?.name || "",
			currency: initialData?.currency || "",
			countries: initialData?.countries || [],
			tags: initialData?.customerTags || [],
			// Convert PSPRequest[] to string[] for form
			psps: initialData?.psps
				? initialData.psps.map((psp) =>
						typeof psp === "string" ? psp : psp.id,
					)
				: [],
		};
	}, [initialData]);

	// Initialize form
	const form = useCommonForm({
		schema: transactionLimitSchema,
		mode: "onBlur",
		defaultValues,
		resetOptions: {
			keepDirtyValues: false, // Reset everything when form resets
			keepErrors: false, // Clear errors on reset
		},
	});

	// Check if all required API data is loaded
	const isAllDataLoaded = useMemo(() => {
		const currenciesLoaded = !currenciesQuery.isLoading;
		const countriesLoaded = !countriesQuery.isLoading;
		const pspsLoaded = !pspsQuery.isLoading;
		const flowActionsLoaded = !flowActionsQuery.isLoading;

		return (
			currenciesLoaded && countriesLoaded && pspsLoaded && flowActionsLoaded
		);
	}, [
		currenciesQuery.isLoading,
		countriesQuery.isLoading,
		pspsQuery.isLoading,
		flowActionsQuery.isLoading,
	]);

	// Reset form with initial data once all APIs are loaded
	useEffect(() => {
		if (isAllDataLoaded && initialData && flowActionsQuery.data) {
			// Reset the form first
			form.reset(defaultValues);

			// Then populate with the initial data
			const formWrapper = {
				setValue: (name: string | number, value: unknown) => {
					form.setValue(name as string, value);
				},
			};
			populateFormWithInitialData(
				formWrapper,
				flowActionsQuery.data,
				initialData,
			);
		}
	}, [
		isAllDataLoaded,
		initialData,
		flowActionsQuery.data,
		form,
		defaultValues,
	]);

	// Create field props
	const basicFieldProps = createBasicFieldProps(
		form,
		{
			currencies: currenciesQuery.data || [],
			countries: countriesQuery.data || [],
			psps: pspsQuery.data || [],
			currenciesLoading: currenciesQuery.isLoading,
			countriesLoading: countriesQuery.isLoading,
			pspsLoading: pspsQuery.isLoading,
		},
		t,
	);

	const flowActionFields = createAllFlowActionFieldProps(
		form,
		flowActionsQuery.data || [],
		t,
	);

	// Handle form submission
	const handleFormSubmit = createFormSubmitHandler(form, (data) => {
		// Type assertion for form data to match expected FormData interface
		// brandId and environmentId are automatically added via headers
		const formData = transformFormDataToAPI(
			data as {
				name: string;
				currency: string;
				countries: string[];
				tags: string[];
				psps: string[];
				[key: string]: unknown;
			},
			flowActionsQuery.data || [],
		);
		onSubmit(formData);
	});

	return {
		form,
		basicFieldProps,
		flowActionFields,
		flowActions: flowActionsQuery.data || [],
		isLoading: flowActionsQuery.isLoading,
		handleFormSubmit,
	};
};
