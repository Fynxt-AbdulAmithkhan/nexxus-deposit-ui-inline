import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlowActionService, PSPService } from "@/api/services";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import {
	createFormSubmitHandler,
	useCommonForm,
} from "@/hooks/use-common-form";
import { useFlowType } from "@/hooks/use-flow-type";
import type { FeeFormData } from "../types";
import { createFeeFieldProps } from "../utils/fee-field-creators";
import { createFeeSchema } from "../validation/fee.validation";

/**
 * Interface for form props
 */
interface UseFeeFormProps {
	initialData?: Partial<FeeFormData>;
	onSubmit: (data: FeeFormData) => void;
	mode: "create" | "edit";
}

/**
 * Helper function to fetch currencies
 */
const useCurrenciesQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["currencies", brandId, environmentId],
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return PSPService.getCurrencies();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!(brandId && environmentId) && isReady,
	});
};

/**
 * Helper function to fetch countries
 */
const useCountriesQuery = (
	brandId?: string,
	environmentId?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["countries", brandId, environmentId],
		queryFn: () => {
			if (!(brandId && environmentId)) {
				throw new Error("Brand and environment must be selected");
			}
			return PSPService.getCountries();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!(brandId && environmentId) && isReady,
	});
};

/**
 * Helper function to fetch flow actions
 */
const useFlowActionsQuery = (flowTypeId?: string) => {
	return useQuery({
		queryKey: ["flowActions", flowTypeId],
		queryFn: () => {
			if (!flowTypeId) {
				throw new Error("Flow type must be selected");
			}
			return FlowActionService.getFlowActions(flowTypeId);
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!flowTypeId,
	});
};

/**
 * Helper function to fetch PSPs
 */
const usePSPsQuery = (
	brandId?: string,
	environmentId?: string,
	actionId?: string,
	currency?: string,
	isReady = true,
) => {
	return useQuery({
		queryKey: ["psps", brandId, environmentId, actionId, currency],
		queryFn: () => {
			if (!(brandId && environmentId && actionId && currency)) {
				throw new Error(
					"Brand, environment, action, and currency must be selected",
				);
			}
			return PSPService.getPSPsByActionAndCurrency(actionId, currency);
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: !!(brandId && environmentId && actionId && currency) && isReady,
	});
};

/**
 * Custom hook for fee form logic
 */
export const useFeeForm = ({
	initialData,
	onSubmit,
	mode,
}: UseFeeFormProps) => {
	const { t } = useTranslation();
	const { selectedBrand, selectedEnvironment, isReady } = useBrandEnvironment();
	const { selectedFlowType } = useFlowType();

	// State to track available component types
	const [availableTypes, setAvailableTypes] = useState<string[]>([
		"FIXED",
		"PERCENTAGE",
	]);

	// Fetch data queries
	const currenciesQuery = useCurrenciesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
		isReady,
	);
	const countriesQuery = useCountriesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
		isReady,
	);
	const flowActionsQuery = useFlowActionsQuery(selectedFlowType?.id);

	// Create validation schema
	const feeSchema = createFeeSchema(t);

	// Initialize form
	const form = useCommonForm({
		schema: feeSchema,
		mode: "onChange",
		defaultValues: {
			name: initialData?.name || "",
			flowActionId: initialData?.flowActionId || "",
			currency: initialData?.currency || "",
			chargeFeeType: initialData?.chargeFeeType || ("INCLUSIVE" as const),
			status: initialData?.status || ("ENABLED" as const),
			components: initialData?.components || [
				{ type: "FIXED" as const, amount: 0, minValue: 0, maxValue: 0 },
			],
			countries: initialData?.countries || [],
			psps: initialData?.psps || [],
		},
		resetOptions: {
			keepDirtyValues: true,
			keepErrors: true,
		},
	});

	// Watch form values to dynamically fetch PSPs
	const flowActionId = form.watch("flowActionId");
	const currency = form.watch("currency");
	const components = form.watch("components");

	// Fetch PSPs based on watched values
	const pspsQuery = usePSPsQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
		flowActionId,
		currency,
	);

	// Update available types based on selected components
	useEffect(() => {
		const usedTypes = components.map((c) => c.type);
		const allTypes: Array<"FIXED" | "PERCENTAGE"> = ["FIXED", "PERCENTAGE"];
		const remaining = allTypes.filter((type) => !usedTypes.includes(type));
		setAvailableTypes(remaining);
	}, [components]);

	// Check if all required API data is loaded
	const isAllDataLoaded = useMemo(() => {
		const currenciesLoaded = !currenciesQuery.isLoading;
		const countriesLoaded = !countriesQuery.isLoading;
		const flowActionsLoaded = !flowActionsQuery.isLoading;

		// For creating new fee, only need currencies, countries, and flow actions
		if (!initialData) {
			return currenciesLoaded && countriesLoaded && flowActionsLoaded;
		}

		// For editing existing fee, need all data including PSPs
		const pspsLoaded = !pspsQuery.isLoading;
		return (
			currenciesLoaded && countriesLoaded && flowActionsLoaded && pspsLoaded
		);
	}, [
		currenciesQuery.isLoading,
		countriesQuery.isLoading,
		flowActionsQuery.isLoading,
		pspsQuery.isLoading,
		initialData,
	]);

	// Reset form with initial data once all APIs are loaded
	useEffect(() => {
		if (isAllDataLoaded && initialData && mode === "edit") {
			form.reset({
				name: initialData.name || "",
				flowActionId: initialData.flowActionId || "",
				currency: initialData.currency || "",
				chargeFeeType: initialData.chargeFeeType || ("INCLUSIVE" as const),
				status: initialData.status || ("ENABLED" as const),
				components: initialData.components || [
					{ type: "FIXED" as const, amount: 0, minValue: 0, maxValue: 0 },
				],
				countries: initialData.countries || [],
				psps: initialData.psps || [],
			});
		}
	}, [isAllDataLoaded, initialData, mode, form]);

	// Clear PSP selection when action or currency changes
	useEffect(() => {
		const subscription = form.watch((_value, { name }) => {
			if (name === "flowActionId" || name === "currency") {
				form.setValue("psps", [], {
					shouldValidate: false,
					shouldDirty: true,
				});
			}
		});
		return () => subscription.unsubscribe();
	}, [form]);

	// Create field props
	const fieldProps = createFeeFieldProps(
		form,
		{
			currencies: currenciesQuery.data || [],
			countries: countriesQuery.data || [],
			flowActions: flowActionsQuery.data || [],
			psps: pspsQuery.data || [],
			currenciesLoading: currenciesQuery.isLoading,
			countriesLoading: countriesQuery.isLoading,
			flowActionsLoading: flowActionsQuery.isLoading,
			pspsLoading: pspsQuery.isLoading,
			currenciesError: currenciesQuery.isError,
			countriesError: countriesQuery.isError,
			flowActionsError: flowActionsQuery.isError,
			pspsError: pspsQuery.isError,
		},
		t,
	);

	// Handle form submission
	const handleFormSubmit = createFormSubmitHandler(form, (data) => {
		const formData: FeeFormData = {
			name: data.name,
			flowActionId: data.flowActionId,
			currency: data.currency,
			chargeFeeType: data.chargeFeeType,
			status: data.status,
			components: data.components,
			countries: data.countries,
			psps: data.psps,
		};
		onSubmit(formData);
	});

	// Component management functions
	const addComponent = () => {
		if (availableTypes.length === 0) {
			return;
		}
		const currentComponents = form.getValues("components");
		form.setValue("components", [
			...currentComponents,
			{
				type: availableTypes[0] as "FIXED" | "PERCENTAGE",
				amount: 0,
				minValue: 0,
				maxValue: 0,
			},
		]);
	};

	const removeComponent = (index: number) => {
		const currentComponents = form.getValues("components");
		form.setValue(
			"components",
			currentComponents.filter((_, i) => i !== index),
		);
	};

	const updateComponent = (
		index: number,
		field: string,
		value: string | number,
	) => {
		const currentComponents = form.getValues("components");
		const updatedComponents = currentComponents.map((comp, i) =>
			i === index ? { ...comp, [field]: value } : comp,
		);
		form.setValue("components", updatedComponents, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	return {
		form,
		fieldProps,
		handleFormSubmit,
		isAllDataLoaded,
		mode,
		availableTypes,
		addComponent,
		removeComponent,
		updateComponent,
	};
};
