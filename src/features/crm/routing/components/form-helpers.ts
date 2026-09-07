import type { RuleGroupTypeIC } from "react-querybuilder";
import { parseJsonLogic } from "react-querybuilder/parseJsonLogic";
import type { PriorityPSP, WeightagePSP } from "../types";
import {
	controlElements,
	queryFields,
	weightageQueryFields,
} from "./query-builder-config";

/**
 * Helper function to get initial query structure based on routing method
 */
export const getInitialQuery = (
	method: "WEIGHTAGE" | "PRIORITY",
): RuleGroupTypeIC => {
	if (method === "WEIGHTAGE") {
		return {
			combinator: "and",
			rules: [
				{
					field: "currency",
					operator: "=",
					value: [],
				},
				{
					field: "country",
					operator: "=",
					value: [],
				},
			],
		} as unknown as RuleGroupTypeIC;
	}

	// For Priority mode, show currency and country by default
	return {
		combinator: "and",
		rules: [
			{
				field: "currency",
				operator: "=",
				value: [],
			},
			{
				field: "country",
				operator: "=",
				value: [],
			},
		],
	} as unknown as RuleGroupTypeIC;
};

/**
 * Helper function to get query fields based on routing method
 */
export const getQueryFields = (method: "WEIGHTAGE" | "PRIORITY") => {
	// Import query fields dynamically to avoid circular dependency

	return method === "WEIGHTAGE" ? weightageQueryFields : queryFields;
};

/**
 * Helper function to parse condition JSON back to query format
 */
export const parseConditionJsonToQuery = (
	conditionData: Record<string, unknown>,
): RuleGroupTypeIC => {
	try {
		// Use parseJSONata to convert JSON Logic format to query builder format
		const parsedQuery = parseJsonLogic(
			JSON.stringify(conditionData),
		) as unknown as RuleGroupTypeIC;

		// If parsing is successful and returns a valid query structure
		if (
			parsedQuery &&
			typeof parsedQuery === "object" &&
			"combinator" in parsedQuery
		) {
			return parsedQuery as unknown as RuleGroupTypeIC;
		}

		// Fallback to default query structure
		console.warn(
			"Failed to parse conditionJson, using default query structure",
		);
		return {
			combinator: "and",
			rules: [
				{
					field: "currency",
					operator: "=",
					value: [],
				},
				{
					field: "country",
					operator: "=",
					value: [],
				},
			],
		} as unknown as RuleGroupTypeIC;
	} catch (error) {
		console.error("Error parsing conditionJson:", error);
		// Return default query structure on error
		return {
			combinator: "and",
			rules: [
				{
					field: "currency",
					operator: "=",
					value: [],
				},
				{
					field: "country",
					operator: "=",
					value: [],
				},
			],
		} as unknown as RuleGroupTypeIC;
	}
};

/**
 * Helper function to get control elements based on routing method
 */
export const getControlElements = (method: "WEIGHTAGE" | "PRIORITY") => {
	if (method === "PRIORITY") {
		return {
			...controlElements,
			removeRuleAction: () => null, // Hide remove rule button
			removeGroupAction: () => null, // Hide remove group button
			addRuleAction: () => null, // Hide add rule button
			addGroupAction: () => null, // Hide add group button
		};
	}
	return controlElements; // For Weightage mode, use full control elements
};

/**
 * Helper function to transform PSPs based on routing method
 */
export const transformPspsForSubmission = (
	routingMethod: "WEIGHTAGE" | "PRIORITY",
	priorityPsps: Array<{ id: string; pspId: string }>,
	weightagePsps: Array<{ id: string; pspId: string; pspValue: number }>,
): PriorityPSP[] | WeightagePSP[] => {
	if (routingMethod === "PRIORITY") {
		return priorityPsps.map(
			(psp, index): PriorityPSP => ({
				pspId: psp.pspId,
				pspOrder: index + 1,
			}),
		);
	}

	return weightagePsps.map(
		(psp, index): WeightagePSP => ({
			pspId: psp.pspId,
			pspOrder: index + 1,
			pspValue: psp.pspValue,
		}),
	);
};

/**
 * Helper function to create PSP options from API data
 */
export const createPspOptions = (pspsData: unknown[]) => {
	if (!Array.isArray(pspsData)) {
		return [];
	}
	return pspsData.map((psp: unknown) => {
		const pspObj = psp as { name?: string; id: string };
		return {
			label: pspObj.name || pspObj.id,
			value: pspObj.id,
		};
	});
};

/**
 * Helper function to validate PSP selection
 */
export const validatePSP = (
	pspId: string,
	currentId: string,
	priorityPsps: Array<{ id: string; pspId: string }>,
	setPspErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
): boolean => {
	if (!pspId) {
		setPspErrors((prev) => ({
			...prev,
			[`${currentId}-psp`]: "PSP is required",
		}));
		return false;
	}

	// Check for duplicates - exclude the current item being validated
	const currentIndex = priorityPsps.findIndex(
		(_, index) => `psp-${index}` === currentId,
	);
	const duplicateCount = priorityPsps.filter(
		(psp, index) => psp.pspId === pspId && index !== currentIndex,
	).length;

	if (duplicateCount > 0) {
		setPspErrors((prev) => ({
			...prev,
			[`${currentId}-psp`]: "PSP already selected",
		}));
		return false;
	}

	// Clear error if validation passes
	setPspErrors((prev) => {
		const newErrors = { ...prev };
		delete newErrors[`${currentId}-psp`];
		return newErrors;
	});
	return true;
};
