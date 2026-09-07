/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <complexity> */
/** biome-ignore-all lint/suspicious/noExplicitAny: <complex> */
import { zodResolver } from "@hookform/resolvers/zod";
import {
	type FieldValues,
	type Path,
	type UseFormProps,
	type UseFormReturn,
	useForm,
} from "react-hook-form";
import { z } from "zod";

// Define regex at top level for performance
const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

/**
 * Common form hook that integrates with your Chakra UI components
 * Provides type-safe form handling with Zod validation
 */
export function useCommonForm<T extends FieldValues>({
	schema,
	defaultValues,
	mode = "onChange",
	...formOptions
}: {
	schema: z.ZodSchema<T>;
	defaultValues?: T;
	mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
} & Omit<
	UseFormProps<T>,
	"resolver" | "defaultValues" | "mode"
>): UseFormReturn<T> {
	return useForm<T>({
		resolver: zodResolver(schema as any),
		defaultValues: defaultValues as any,
		mode,
		...formOptions,
	});
}

/**
 * Utility to create form field props for Chakra UI components
 * Handles error states and validation messages
 */
export function createFieldProps<T extends FieldValues>(
	form: UseFormReturn<T>,
	fieldName: Path<T>,
) {
	const error = form.formState.errors[fieldName];

	return {
		errorMessage: error?.message as string | undefined,
		isInvalid: !!error,
	};
}

/**
 * Utility to create input field props with common patterns
 */
export function createInputProps<T extends FieldValues>(
	form: UseFormReturn<T>,
	fieldName: Path<T>,
	options: {
		label?: string;
		tooltip?: string;
		placeholder?: string;
		required?: boolean;
		type?: string;
		helpText?: string;
		size?: "sm" | "md" | "lg" | "xs";
		isDisabled?: boolean;
	} = {},
) {
	const { errorMessage, isInvalid } = createFieldProps(form, fieldName);
	const { onBlur, name, ref } = form.register(fieldName);

	return {
		...options,
		errorMessage,
		isInvalid,
		name,
		ref,
		value: (form.watch(fieldName) as string) || "",
		onChange: (value: string) => {
			form.setValue(fieldName, value as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		},
		onBlur,
	};
}

/**
 * Utility to create select field props with options
 */
export function createSelectProps<T extends FieldValues>(
	form: UseFormReturn<T>,
	fieldName: Path<T>,
	options: {
		label?: string;
		placeholder?: string;
		required?: boolean;
		size?: "sm" | "md" | "lg" | "xs";
		isDisabled?: boolean;
		selectOptions: Array<{ label: string; value: string }>;
		showSearch?: boolean;
		tooltip?: string;
	},
) {
	const { errorMessage, isInvalid } = createFieldProps(form, fieldName);
	const { onBlur, name, ref } = form.register(fieldName);
	const { selectOptions, ...restOptions } = options;

	return {
		...restOptions,
		options: selectOptions,
		errorMessage,
		isInvalid,
		name,
		ref,
		value: (form.watch(fieldName) as string) || "",
		onChange: (value: string) => {
			form.setValue(fieldName, value as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		},
		onBlur,
	};
}

/**
 * Utility to create multi-select field props
 */
export function createMultiSelectProps<T extends FieldValues>(
	form: UseFormReturn<T>,
	fieldName: Path<T>,
	options: {
		label?: string;
		placeholder?: string;
		required?: boolean;
		size?: "sm" | "md" | "lg";
		isDisabled?: boolean;
		selectOptions: Array<{ label: string; value: string; icon?: string }>;
		showSearch?: boolean;
		maxVisible?: number;
		tooltip?: string;
	},
) {
	const { errorMessage, isInvalid } = createFieldProps(form, fieldName);
	const { onBlur, name, ref } = form.register(fieldName);
	const { selectOptions, ...restOptions } = options;

	return {
		...restOptions,
		options: selectOptions,
		errorMessage,
		isInvalid,
		name,
		ref,
		value: (form.watch(fieldName) as string[]) || [],
		onChange: (values: string[]) => {
			form.setValue(fieldName, values as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		},
		onBlur,
	};
}

/**
 * Utility to create number input field props
 */
export function createNumberInputProps<T extends FieldValues>(
	form: UseFormReturn<T>,
	fieldName: Path<T>,
	options: {
		label?: string;
		placeholder?: string;
		required?: boolean;
		min?: number;
		max?: number;
		step?: number;
		size?: "sm" | "md" | "lg" | "xs";
		isDisabled?: boolean;
		helpText?: string;
		tooltip?: string;
		defaultValue?: string;
	} = {},
) {
	const { errorMessage, isInvalid } = createFieldProps(form, fieldName);
	const { onBlur, name, ref } = form.register(fieldName);

	return {
		...options,
		errorMessage,
		isInvalid,
		defaultValue: options.defaultValue || 0,
		name,
		ref,
		value: String((form.watch(fieldName) as number) || ""),
		onChange: (value: string) => {
			const numValue = value === "" ? 0 : Number.parseFloat(value);
			form.setValue(fieldName, numValue as any, {
				shouldValidate: true,
				shouldDirty: true,
			});
		},
		onBlur,
	};
}

/**
 * Utility to handle form submission with error handling
 */
export function createFormSubmitHandler<T extends FieldValues>(
	form: UseFormReturn<T>,
	onSubmit: (data: T) => void | Promise<void>,
	onError?: (errors: Record<string, unknown>) => void,
) {
	return form.handleSubmit(
		async (data) => {
			try {
				await onSubmit(data);
			} catch (error) {
				console.error("Form submission error:", error);
				// You can add toast notifications here
			}
		},
		(errors) => {
			console.error("Form validation errors:", errors);
			onError?.(errors);
		},
	);
}

/**
 * Utility to reset form with new default values
 */
export function resetFormWithDefaults<T extends FieldValues>(
	form: UseFormReturn<T>,
	newDefaults: T,
) {
	form.reset(newDefaults);
}

/**
 * Utility to check if form has unsaved changes
 */
export function hasUnsavedChanges<T extends FieldValues>(
	form: UseFormReturn<T>,
): boolean {
	return form.formState.isDirty;
}

/**
 * Utility to get all form values as a plain object
 */
export function getFormValues<T extends FieldValues>(
	form: UseFormReturn<T>,
): T {
	return form.getValues();
}

/**
 * Utility to set multiple form values at once
 */
export function setFormValues<T extends FieldValues>(
	form: UseFormReturn<T>,
	values: Partial<T>,
	options?: { shouldValidate?: boolean; shouldDirty?: boolean },
) {
	for (const [key, value] of Object.entries(values)) {
		form.setValue(key as Path<T>, value as any, options);
	}
}

/**
 * Type for translation function
 */
type TranslationFunction = (
	key: string,
	options?: Record<string, unknown>,
) => string;

/**
 * Common validation schemas for reusable form fields
 * Now supports internationalization through translation function
 */
export const createCommonSchemas = (t: TranslationFunction) => ({
	requiredString: (message?: string) =>
		z.string().min(1, message || t("common.validation.required")),

	optionalString: () => z.string().optional(),

	email: (message?: string) =>
		z.string().email(message || t("common.validation.email")),

	url: (message?: string) =>
		z.string().url(message || t("common.validation.url")),

	phoneNumber: (message?: string) =>
		z
			.string()
			.regex(PHONE_REGEX, message || t("common.validation.phoneNumber")),

	positiveNumber: (message?: string) =>
		z.number().positive(message || t("common.validation.positiveNumber")),

	nonNegativeNumber: (message?: string) =>
		z.number().min(0, message || t("common.validation.nonNegativeNumber")),

	minLength: (min: number, message?: string) =>
		z.string().min(min, message || t("common.validation.minLength", { min })),

	maxLength: (max: number, message?: string) =>
		z.string().max(max, message || t("common.validation.maxLength", { max })),

	requiredArray: (message?: string) =>
		z.array(z.string()).min(1, message || t("common.validation.requiredArray")),

	optionalArray: () => z.array(z.string()).optional(),

	currency: (message?: string) =>
		z.string().min(1, message || t("common.validation.currency")),

	country: (message?: string) =>
		z.array(z.string()).min(1, message || t("common.validation.country")),

	tags: () => z.array(z.string()).optional(),

	status: (validStatuses: string[] = ["ENABLED", "DISABLED"]) =>
		z.enum(validStatuses as [string, ...string[]]),
});

/**
 * Type for form field configuration
 */
export type FormFieldConfig<T extends FieldValues> = {
	name: Path<T>;
	type:
		| "text"
		| "email"
		| "password"
		| "number"
		| "select"
		| "multiselect"
		| "textarea";
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: Array<{ label: string; value: string; icon?: string }>;
	validation?: z.ZodTypeAny;
	helpText?: string;
	size?: "sm" | "md" | "lg" | "xs";
	isDisabled?: boolean;
	tooltip?: string;
};

/**
 * Utility to create a complete form configuration from field definitions with translations
 * @param fields - Array of field configurations
 * @param t - Translation function
 * @returns Form configuration with translated validation messages
 */
export function createFormConfig<T extends FieldValues>(
	fields: FormFieldConfig<T>[],
	t: TranslationFunction,
): {
	schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
	defaultValues: Partial<T>;
} {
	const translatedSchemas = createCommonSchemas(t);
	const schemaFields: Record<string, z.ZodTypeAny> = {};
	const defaultValues: Partial<T> = {};

	for (const field of fields) {
		let fieldSchema: z.ZodTypeAny;

		switch (field.type) {
			case "email":
				fieldSchema = field.required
					? translatedSchemas.email()
					: translatedSchemas.optionalString();
				break;
			case "number":
				fieldSchema = field.required
					? translatedSchemas.nonNegativeNumber()
					: z.number().optional();
				break;
			case "select":
				fieldSchema = field.required
					? translatedSchemas.requiredString()
					: translatedSchemas.optionalString();
				break;
			case "multiselect":
				fieldSchema = field.required
					? translatedSchemas.requiredArray()
					: translatedSchemas.optionalArray();
				break;
			default:
				fieldSchema = field.required
					? translatedSchemas.requiredString()
					: translatedSchemas.optionalString();
		}

		// Override with custom validation if provided
		if (field.validation) {
			fieldSchema = field.validation;
		}

		schemaFields[field.name as string] = fieldSchema;

		// Set default values based on field type
		switch (field.type) {
			case "number":
				(defaultValues as Record<string, unknown>)[field.name as string] = 0;
				break;
			case "multiselect":
				(defaultValues as Record<string, unknown>)[field.name as string] = [];
				break;
			default:
				(defaultValues as Record<string, unknown>)[field.name as string] = "";
		}
	}

	return {
		schema: z.object(schemaFields),
		defaultValues,
	};
}
