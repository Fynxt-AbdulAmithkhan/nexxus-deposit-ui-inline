import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { formatQuery, type RuleGroupTypeIC } from "react-querybuilder";
import { z } from "zod";
import type { RoutingRuleFormData } from "../../types";
import {
	getInitialQuery,
	getQueryFields,
	parseConditionJsonToQuery,
} from "../form-helpers";

// Form validation schema
const routingRuleSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must be less than 100 characters"),
	time: z.enum(["HOUR", "DAY", "WEEK", "MONTH"], {
		required_error: "Time is required",
	}),
	rule: z.enum(["COUNT", "AMOUNT", "PERCENTAGE"]).optional(),
	routingMethod: z.enum(["WEIGHTAGE", "PRIORITY"], {
		required_error: "Routing method is required",
	}),
	status: z.enum(["ENABLED", "DISABLED"]),
	conditions: z.object({
		combinator: z.enum(["and", "or"]).optional(),
		rules: z.array(z.any()),
	}),
});

export type RoutingRuleFormValues = z.infer<typeof routingRuleSchema>;

interface UseRoutingFormProps {
	initialData?: Partial<RoutingRuleFormData>;
	mode: "create" | "edit";
	onClear?: (clearFn: () => void) => void;
}

export const useRoutingForm = ({
	initialData,
	mode,
	onClear,
}: UseRoutingFormProps) => {
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<RoutingRuleFormValues>({
		resolver: zodResolver(routingRuleSchema),
		defaultValues: {
			name: initialData?.name || "",
			time: initialData?.time || "DAY",
			rule: initialData?.rule || "COUNT",
			routingMethod: initialData?.pspSelectionMode || "WEIGHTAGE",
			status: initialData?.status || "ENABLED",
			conditions: {
				combinator: "and",
				rules: [],
			},
		},
	});

	// Watch routing method and form values
	const routingMethod = watch("routingMethod");
	const watchedValues = watch();

	// Query builder state
	const [query, setQuery] = useState<RuleGroupTypeIC>(
		getInitialQuery(initialData?.pspSelectionMode || "WEIGHTAGE"),
	);

	const [queryFieldsData, setQueryFieldsData] = useState(
		getQueryFields(initialData?.pspSelectionMode || "WEIGHTAGE"),
	);

	// State for managing PSPs - Weightage mode
	const [weightagePsps, setWeightagePsps] = useState<
		Array<{ id: string; pspId: string; pspValue: number }>
	>([]);

	// State for managing PSPs - Priority mode
	const [priorityPsps, setPriorityPsps] = useState<
		Array<{ id: string; pspId: string }>
	>([]);

	// State for PSP errors
	const [pspErrors, setPspErrors] = useState<Record<string, string>>({});
	const [conditionJson, setConditionJson] = useState<
		Record<string, unknown> | undefined
	>();

	// Clear form function
	const clearForm = useCallback(() => {
		reset({
			name: "",
			time: "DAY",
			rule: "COUNT",
			routingMethod: "WEIGHTAGE",
			status: "ENABLED",
			conditions: {
				combinator: "and",
				rules: [],
			},
		});

		setPriorityPsps([]);
		setWeightagePsps([]);
		setPspErrors({});
		const resetQuery = getInitialQuery("WEIGHTAGE");
		setQuery(resetQuery);
		setConditionJson(undefined);
	}, [reset]);

	// Handle query change
	const handleQueryChange = useCallback(
		(newQuery: RuleGroupTypeIC) => {
			setQuery(newQuery);
			// formatQuery's jsonlogic output is nullable (an empty group yields null in
			// react-querybuilder 8.23), and the field is optional rather than nullable.
			const jsonLogic = formatQuery(newQuery, "jsonlogic");
			setConditionJson(
				jsonLogic && typeof jsonLogic === "object"
					? (jsonLogic as Record<string, unknown>)
					: undefined,
			);
			setValue("conditions", {
				combinator: newQuery.combinator as "and" | "or" | undefined,
				rules: newQuery.rules,
			});
		},
		[setValue],
	);

	// Reset query when routing method changes
	const resetQueryBuilder = useCallback(() => {
		setQueryFieldsData(getQueryFields(routingMethod));
		const resetQuery = getInitialQuery(routingMethod);
		handleQueryChange(resetQuery);
	}, [routingMethod, handleQueryChange]);

	// Handler functions for PSP management
	const handlePriorityPspsChange = (
		newPsps: Array<{ id: string; pspId: string }>,
	) => {
		setPriorityPsps(newPsps);

		// Clear errors for removed PSPs
		const newPspsIds = newPsps.map((_, index) => `psp-${index}`);
		setPspErrors((prev) => {
			const newErrors = { ...prev };
			for (const key of Object.keys(newErrors)) {
				const pspId = key.replace("-psp", "");
				if (!newPspsIds.includes(pspId)) {
					delete newErrors[key];
				}
			}
			return newErrors;
		});
	};

	const handleWeightagePspsChange = (
		newPsps: Array<{
			id: string;
			pspId: string;
			pspValue: number;
		}>,
	) => {
		setWeightagePsps(newPsps);
	};

	// Initialize form data only once using useMemo
	useMemo(() => {
		if (initialData && mode === "edit") {
			// Reset form with initial data
			reset({
				name: initialData.name || "",
				time: initialData.time || "DAY",
				rule: initialData.rule || "COUNT",
				routingMethod: initialData.pspSelectionMode || "WEIGHTAGE",
				status: initialData.status || "ENABLED",
				conditions: {
					combinator: "and",
					rules: [],
				},
			});

			// Initialize PSPs based on the data
			if (initialData.psps) {
				if (initialData.pspSelectionMode === "PRIORITY") {
					const priorityPspsData = initialData.psps.map((psp, index) => ({
						id: `psp-${index}`,
						pspId: psp.pspId,
					}));
					setPriorityPsps(priorityPspsData);
				} else {
					const weightagePspsData = initialData.psps.map((psp, index) => ({
						id: `psp-${index}`,
						pspId: psp.pspId,
						pspValue: (psp as { pspValue?: number }).pspValue || 0,
					}));
					setWeightagePsps(weightagePspsData);
				}
			}

			// Initialize query builder with existing conditions
			if (
				initialData.conditionJson &&
				Object.keys(initialData.conditionJson).length > 0
			) {
				// Try to parse existing conditions back to query format
				const existingQuery = parseConditionJsonToQuery(
					initialData.conditionJson,
				);
				setQuery(existingQuery);
				setConditionJson(initialData.conditionJson);
			} else {
				// Initialize with default query if no existing conditions
				console.log("No existing conditions, initializing with default query");
				const defaultQuery = getInitialQuery(
					initialData.pspSelectionMode || "WEIGHTAGE",
				);
				setQuery(defaultQuery);
				setConditionJson(undefined);
			}
		} else if (mode === "create") {
			// Clear form for create mode
			clearForm();
		}
	}, [initialData, mode, reset, clearForm]);

	// Handle modal close/clear
	const onClearRef = useRef(onClear);
	onClearRef.current = onClear;

	useEffect(() => {
		if (onClearRef.current) {
			// Expose clear function to parent
			onClearRef.current(clearForm);
		}
	}, [clearForm]);

	return {
		// Form methods
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },

		// Form state
		routingMethod,
		watchedValues,

		// Query builder state
		query,
		setQuery,
		queryFieldsData,
		handleQueryChange,
		resetQueryBuilder,

		// PSP state
		weightagePsps,
		priorityPsps,
		pspErrors,
		setPspErrors,
		conditionJson,

		// PSP handlers
		handlePriorityPspsChange,
		handleWeightagePspsChange,

		// Utility functions
		clearForm,
	};
};
