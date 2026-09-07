import { Box, Button } from "@chakra-ui/react";
import type {
	ActionProps,
	CombinatorSelectorProps,
	FieldSelectorProps,
	OperatorSelectorProps,
	Field as QueryField,
	ValueEditorProps,
} from "react-querybuilder";
import CommonInput from "@/components/forms/input";
import { MultiSelect } from "@/components/forms/multi-select";
import CommonSelect from "@/components/forms/select";
import { Icon } from "@/components/ui/Icon/icon";
import { getCountryOptions, getCurrencyOptions } from "@/utils/currency";

// Define query builder fields
export const queryFields: QueryField[] = [
	{
		name: "currency",
		label: "Currency",
		valueEditorType: "select",
		values: getCurrencyOptions().map((currency) => ({
			name: currency.value,
			label: currency.label,
		})),
	},
	{
		name: "country",
		label: "Country",
		valueEditorType: "multiselect",
		values: getCountryOptions().map((country) => ({
			name: country.value,
			label: country.label,
		})),
	},
];

// Define query builder fields for Weightage routing method
export const weightageQueryFields: QueryField[] = [
	{
		name: "currency",
		label: "Currency",
		valueEditorType: "select",
		values: getCurrencyOptions().map((currency) => ({
			name: currency.value,
			label: currency.label,
		})),
	},
	{
		name: "country",
		label: "Country",
		valueEditorType: "multiselect",
		values: getCountryOptions().map((country) => ({
			name: country.value,
			label: country.label,
		})),
	},
];

// Custom Operator Selector Component
export const CustomOperatorSelector = (props: OperatorSelectorProps) => {
	const { value, handleOnChange, options } = props;

	// Use default operators from react-querybuilder
	const selectOptions = (options as Array<{ name: string; label: string }>).map(
		(option) => ({
			value: option.name,
			label: option.label,
		}),
	);

	return (
		<CommonSelect
			label="Condition"
			onChange={(newValue) => handleOnChange(newValue)}
			options={selectOptions}
			placeholder="Select operator..."
			size="sm"
			value={value as string}
		/>
	);
};

// Custom Combinator Selector Component (AND/OR)
export const CustomCombinatorSelector = (props: CombinatorSelectorProps) => {
	const { value, handleOnChange } = props;

	// Only allow AND condition
	const options = [{ value: "and", label: "AND" }];

	return (
		<CommonSelect
			onChange={(newValue) => handleOnChange(newValue)}
			options={options}
			placeholder="Select condition..."
			size="sm"
			value={value as string}
			width="10%"
		/>
	);
};

// Custom Field Selector Component
export const CustomFieldSelector = (props: FieldSelectorProps) => {
	const { value, handleOnChange, options } = props;

	// Convert field options to CommonSelect format
	const selectOptions = (options as Array<{ name: string; label: string }>).map(
		(option) => ({
			value: option.name,
			label: option.label,
		}),
	);

	return (
		<CommonSelect
			label="Parameter"
			onChange={(newValue) => handleOnChange(newValue)}
			options={selectOptions}
			placeholder="Select parameter..."
			size="sm"
			value={value as string}
		/>
	);
};

// Custom Value Editor Components
export const CustomSelectValueEditor = (props: ValueEditorProps) => {
	const { value, handleOnChange, values } = props;

	// Convert values array to CommonSelect format
	const options =
		values?.map((val) => ({
			value: val.name,
			label: val.label,
		})) || [];

	return (
		<CommonSelect
			label="Values"
			onChange={(newValue) => handleOnChange(newValue)}
			options={options}
			placeholder="Select value..."
			showSearch={true}
			size="sm"
			value={value as string}
		/>
	);
};

export const CustomMultiSelectValueEditor = (props: ValueEditorProps) => {
	const { value, handleOnChange, values, fieldData } = props;

	// Convert values array to MultiSelect format
	const options =
		values?.map((val) => ({
			value: val.name,
			label: val.label,
		})) || [];

	// For multiselect, we need to handle array values properly
	let currentValue: string[] = [];
	if (Array.isArray(value)) {
		currentValue = value as string[];
	} else if (value) {
		currentValue = [value as string];
	}

	return (
		<MultiSelect
			label={fieldData?.label}
			maxVisible={2}
			onChange={(newValues: string[]) => handleOnChange(newValues)}
			options={options}
			placeholder="Select values..."
			showSearch
			size="sm"
			value={currentValue as string[]}
		/>
	);
};

export const CustomTextValueEditor = (props: ValueEditorProps) => {
	const { value, handleOnChange, type, fieldData } = props;

	const getPlaceholder = () => {
		if (fieldData?.inputType === "number") {
			if (fieldData.name === "percentage") {
				return "Enter percentage";
			}
			return "Enter number...";
		}
		return "Enter value...";
	};

	return (
		<CommonInput
			label="Values"
			onChange={(newValue) => handleOnChange(newValue)}
			placeholder={getPlaceholder()}
			size="sm"
			type={fieldData?.inputType || type || "text"}
			value={value as string}
			width="100%"
		/>
	);
};

// Custom button components with icons
export const CustomRemoveRuleButton = (props: ActionProps) => {
	const { handleOnClick, ...restProps } = props;
	return (
		<Box
			className="rule-remove"
			cursor="pointer"
			onClick={handleOnClick}
			{...restProps}
			m={2}
		>
			<Icon color="red" name="trash" />
		</Box>
	);
};

export const CustomRemoveGroupButton = (props: ActionProps) => {
	const { handleOnClick, ...restProps } = props;
	return (
		<Box
			className="ruleGroup-remove"
			cursor="pointer"
			onClick={handleOnClick}
			{...restProps}
			m={2}
		>
			<Icon color="red" name="trash" />
		</Box>
	);
};

export const CustomAddRuleButton = (props: ActionProps) => {
	const { handleOnClick, ...restProps } = props;
	return (
		<Button
			className="ruleGroup-addRule"
			onClick={handleOnClick}
			variant="ghost"
			{...restProps}
		>
			<Icon name="plus" size="xs" />
			Add Rule
		</Button>
	);
};

export const CustomAddGroupButton = (props: ActionProps) => {
	const { handleOnClick, ...restProps } = props;
	return (
		<Button
			className="ruleGroup-addGroup"
			onClick={handleOnClick}
			variant="ghost"
			{...restProps}
		>
			<Icon name="plus" size="xs" />
			Add Group
		</Button>
	);
};

// Control elements configuration
export const controlElements = {
	valueEditor: (props: ValueEditorProps) => {
		const { fieldData } = props;

		if (fieldData?.valueEditorType === "select") {
			return <CustomSelectValueEditor {...props} />;
		}

		if (fieldData?.valueEditorType === "multiselect") {
			return <CustomMultiSelectValueEditor {...props} />;
		}

		if (fieldData?.valueEditorType === "text") {
			return <CustomTextValueEditor {...props} />;
		}

		// Default fallback
		return <CustomTextValueEditor {...props} />;
	},
	operatorSelector: CustomOperatorSelector,
	removeRuleAction: CustomRemoveRuleButton,
	removeGroupAction: CustomRemoveGroupButton,
	addRuleAction: CustomAddRuleButton,
	addGroupAction: CustomAddGroupButton,
	combinatorSelector: CustomCombinatorSelector,
	fieldSelector: CustomFieldSelector,
};
