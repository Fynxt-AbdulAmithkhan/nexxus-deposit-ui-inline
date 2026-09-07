/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <complexity> */
import { Box, Stack } from "@chakra-ui/react";
import type { RoutingRuleFormData } from "../types";
import { transformPspsForSubmission } from "./form-helpers";
import BasicInformation from "./form-sections/basic-information";
import QueryBuilderSection from "./form-sections/query-builder-section";
import RoutingOrderSection from "./form-sections/routing-order-section";
import { usePSPManagement } from "./hooks/use-psp-management";
import {
	type RoutingRuleFormValues,
	useRoutingForm,
} from "./hooks/use-routing-form";

interface RoutingRuleFormProps {
	initialData?: Partial<RoutingRuleFormData>;
	onSubmit: (data: RoutingRuleFormData) => void;
	onCancel: () => void;
	onClear?: (clearFn: () => void) => void;
	isLoading?: boolean;
	mode: "create" | "edit";
}

const RoutingRuleForm: React.FC<RoutingRuleFormProps> = ({
	initialData,
	onSubmit,
	onClear,
	mode,
}) => {
	// Use custom hooks for form logic
	const {
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
		routingMethod,
		watchedValues,
		query,
		queryFieldsData,
		handleQueryChange,
		resetQueryBuilder,
		weightagePsps,
		priorityPsps,
		pspErrors,
		setPspErrors,
		conditionJson,
		handlePriorityPspsChange,
		handleWeightagePspsChange,
	} = useRoutingForm({
		initialData,
		mode,
		onClear,
	});

	// Use PSP management hook
	const { pspOptions, validatePSP, selectedBrand, selectedEnvironment } =
		usePSPManagement({
			setPspErrors,
			priorityPsps,
		});

	const handleFormSubmit = (data: RoutingRuleFormValues) => {
		const brandId = selectedBrand?.id;
		const environmentId = selectedEnvironment?.id;
		if (!(brandId && environmentId)) {
			console.error("Brand or environment not selected");
			return;
		}

		// Transform PSPs using helper function
		const psps = transformPspsForSubmission(
			data.routingMethod,
			priorityPsps,
			weightagePsps,
		);

		// Transform to form data for parent component
		// brandId and environmentId are automatically added via headers
		const formData: RoutingRuleFormData = {
			name: data.name,
			time: data.time,
			rule: data.rule,
			pspSelectionMode: data.routingMethod,
			conditionJson: conditionJson || {},
			status: data.status,
			psps,
			isDefault: false,
		};

		onSubmit(formData);
	};

	return (
		<Box>
			<form onSubmit={handleSubmit(handleFormSubmit)}>
				<Stack gap={4}>
					<BasicInformation
						errors={errors}
						onRoutingMethodChange={resetQueryBuilder}
						routingMethod={routingMethod}
						setValue={setValue}
						watch={watch}
					/>

					<QueryBuilderSection
						onQueryChange={handleQueryChange}
						query={query}
						queryFieldsData={queryFieldsData}
						routingMethod={routingMethod}
					/>

					<RoutingOrderSection
						onPriorityPspsChange={handlePriorityPspsChange}
						onValidatePSP={validatePSP}
						onWeightagePspsChange={handleWeightagePspsChange}
						priorityPsps={priorityPsps}
						pspErrors={pspErrors}
						pspOptions={pspOptions}
						routingMethod={routingMethod}
						watchedValues={watchedValues}
						weightagePsps={weightagePsps}
					/>
				</Stack>
			</form>
		</Box>
	);
};

export default RoutingRuleForm;
