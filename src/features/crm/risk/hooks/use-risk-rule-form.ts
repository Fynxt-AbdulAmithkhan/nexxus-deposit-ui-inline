import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
	RiskRuleCreatePayload,
	RiskRuleUpdatePayload,
} from "@/api/service.types";
import { useFlowType } from "@/hooks";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import {
	createFormSubmitHandler,
	useCommonForm,
} from "@/hooks/use-common-form";
import {
	populateFormWithInitialData,
	transformFormDataToAPI,
} from "../utils/form-data-transformers";
import {
	createBasicFieldProps,
	createCriteriaFieldProps,
} from "../utils/form-field-creators";
import { createRiskRuleSchema } from "../validation/risk-rule.validation";
import {
	useCurrenciesQuery,
	useFlowActionsQuery,
	usePSPsQuery,
} from "./use-risk-rule-queries";

/**
 * Interface for form props
 */
interface UseRiskRuleFormProps {
	initialData?: Partial<RiskRuleCreatePayload | RiskRuleUpdatePayload>;
	onSubmit: (data: RiskRuleCreatePayload | RiskRuleUpdatePayload) => void;
}

/**
 * Custom hook for risk rule form logic
 */
export const useRiskRuleForm = ({
	initialData,
	onSubmit,
}: UseRiskRuleFormProps) => {
	const { t } = useTranslation();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();
	const { selectedFlowType } = useFlowType();

	// Fetch data queries
	const currenciesQuery = useCurrenciesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
	);
	const flowActionsQuery = useFlowActionsQuery(selectedFlowType?.id);

	// Create schema
	const riskRuleSchema = createRiskRuleSchema(t);

	// Memoize default values to prevent unnecessary re-renders
	const defaultValues = useMemo(() => {
		return {
			name: initialData?.name || "",
			type: initialData?.type || "DEFAULT",
			action: initialData?.action || "BLOCK",
			currency: initialData?.currency || "",
			duration: initialData?.duration || "HOUR",
			maxAmount: initialData?.maxAmount || 0,
			flowActionId: initialData?.flowActionId || "",
			status: initialData?.status || "ENABLED",
			// Convert PSPResponse[] to string[] for form
			psps: initialData?.psps ? initialData.psps.map((psp) => psp.id) : [],
			criteriaType:
				initialData?.type === "CUSTOMER" ? initialData.criteriaType : "TAG",
			criteriaValue:
				initialData?.type === "CUSTOMER" ? initialData.criteriaValue : [],
		};
	}, [initialData]);

	// Initialize form
	const form = useCommonForm({
		schema: riskRuleSchema,
		mode: "onChange",
		defaultValues,
		resetOptions: {
			keepDirtyValues: false, // Reset everything when form resets
			keepErrors: false, // Clear errors on reset
		},
	});

	// Watch form values for dependent queries
	const watchedValues = form.watch();

	// Update PSPs query when flowActionId or currency changes
	const pspsQueryWithDeps = usePSPsQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
		watchedValues.flowActionId,
		watchedValues.currency,
	);

	// Check if all required API data is loaded
	const isAllDataLoaded = useMemo(() => {
		const currenciesLoaded = !currenciesQuery.isLoading;
		const flowActionsLoaded = !flowActionsQuery.isLoading;
		const pspsLoaded = !pspsQueryWithDeps.isLoading;

		return currenciesLoaded && flowActionsLoaded && pspsLoaded;
	}, [
		currenciesQuery.isLoading,
		flowActionsQuery.isLoading,
		pspsQueryWithDeps.isLoading,
	]);

	// Reset form with initial data once all APIs are loaded
	useEffect(() => {
		if (isAllDataLoaded && initialData) {
			// Reset the form first
			form.reset(defaultValues);

			// Then populate with the initial data
			const formWrapper = {
				setValue: (name: string | number, value: unknown) => {
					form.setValue(
						name as keyof typeof defaultValues,
						value as string | number | string[] | undefined,
					);
				},
			};
			populateFormWithInitialData(formWrapper, initialData);
		}
	}, [isAllDataLoaded, initialData, form, defaultValues]);

	// Create field props
	const basicFieldProps = createBasicFieldProps(
		form,
		{
			currencies: currenciesQuery.data || [],
			flowActions: (flowActionsQuery.data || []).map((action) => ({
				label: action.name,
				value: action.id,
			})),
			psps: pspsQueryWithDeps.data || [],
			currenciesLoading: currenciesQuery.isLoading,
			flowActionsLoading: flowActionsQuery.isLoading,
			pspsLoading: pspsQueryWithDeps.isLoading,
		},
		t,
	);

	const criteriaFieldProps = createCriteriaFieldProps(form);

	// Get available criteria values based on criteria type
	const getAvailableCriteriaValues = () => {
		if (watchedValues.type !== "CUSTOMER" || !watchedValues.criteriaType) {
			return [];
		}

		if (watchedValues.criteriaType === "TAG") {
			return [
				{ label: "VIP", value: "VIP" },
				{ label: "VVIP", value: "VVIP" },
				{ label: "NORMAL", value: "NORMAL" },
			];
		}
		if (watchedValues.criteriaType === "ACCOUNT_TYPE") {
			return [
				{ label: "INDIVIDUAL", value: "INDIVIDUAL" },
				{ label: "BUSINESS", value: "BUSINESS" },
			];
		}
		return [];
	};

	// Update criteria value options when criteria type changes
	useEffect(() => {
		if (watchedValues.type === "CUSTOMER" && watchedValues.criteriaType) {
			// Reset criteria values when type changes
			form.setValue("criteriaValue", []);
		}
	}, [watchedValues.criteriaType, watchedValues.type, form]);

	// Handle form submission
	const handleFormSubmit = createFormSubmitHandler(form, (data) => {
		// Transform form data to API format
		// brandId and environmentId are automatically added via headers
		const transformedData = transformFormDataToAPI(
			data as {
				name: string;
				type: "DEFAULT" | "CUSTOMER";
				action: "BLOCK" | "ALERT";
				currency: string;
				duration: "HOUR" | "DAY" | "WEEK" | "MONTH";
				maxAmount: number;
				flowActionId: string;
				status: "ENABLED" | "DISABLED";
				psps: string[];
				criteriaType?: "TAG" | "ACCOUNT_TYPE";
				criteriaValue?: string[] | string;
			},
		);
		onSubmit(transformedData);
	});

	return {
		form,
		basicFieldProps,
		criteriaFieldProps,
		getAvailableCriteriaValues,
		isLoading: flowActionsQuery.isLoading || currenciesQuery.isLoading,
		handleFormSubmit,
	};
};
