import { Box, Grid, Heading, HStack, Stack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import CommonInput from "@/components/forms/input";
import MultiSelect from "@/components/forms/multi-select/multi-select";
import CommonSelect from "@/components/forms/select/select";
import { useRiskRuleForm } from "../hooks/use-risk-rule-form";
import type {
	BasicInformationSectionProps,
	PSPConfigurationSectionProps,
	RiskCriteriaSectionProps,
	RiskRuleModalFormProps,
} from "../types";

/**
 * Basic Information Section Component
 */
const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
	fieldProps,
}) => {
	const { t } = useTranslation();
	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("riskRules.form.basicDetails")}
				</Heading>
			</HStack>
			<Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
				<CommonInput {...fieldProps.nameProps} />
				<CommonSelect {...fieldProps.flowActionProps} />

				<CommonSelect {...fieldProps.typeProps} />
				<CommonSelect {...fieldProps.actionProps} />
				<CommonSelect {...fieldProps.durationProps} />
				<CommonSelect {...fieldProps.currencyProps} />
				<CommonInput {...fieldProps.maxAmountProps} />
			</Grid>
		</Box>
	);
};

/**
 * Risk Criteria Section Component (for CUSTOMER type)
 */
const RiskCriteriaSection: React.FC<RiskCriteriaSectionProps> = ({
	criteriaFieldProps,
	getAvailableCriteriaValues,
	isVisible,
}) => {
	const { t } = useTranslation();
	if (!isVisible) {
		return null;
	}

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("riskRules.form.customers")}
				</Heading>
			</HStack>
			<Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
				<CommonSelect {...criteriaFieldProps.criteriaTypeProps} />
				<MultiSelect
					{...criteriaFieldProps.criteriaValueProps}
					options={getAvailableCriteriaValues()}
				/>
			</Grid>
		</Box>
	);
};

/**
 * PSP Configuration Section Component
 */
const PSPConfigurationSection: React.FC<PSPConfigurationSectionProps> = ({
	pspsProps,
}) => {
	const { t } = useTranslation();
	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("riskRules.form.psp")}
				</Heading>
			</HStack>
			<MultiSelect {...pspsProps} />
		</Box>
	);
};

const RiskRuleForm: React.FC<RiskRuleModalFormProps> = ({
	initialData,
	onSubmit,
	formId,
}) => {
	const {
		basicFieldProps,
		criteriaFieldProps,
		getAvailableCriteriaValues,
		handleFormSubmit,
		form,
	} = useRiskRuleForm({
		initialData,
		onSubmit,
	});

	// Watch form values to determine which sections to show
	const watchedValues = form?.watch() || {};

	return (
		<Box>
			<form id={formId} onSubmit={handleFormSubmit}>
				<Stack gap={6}>
					<BasicInformationSection fieldProps={basicFieldProps} />

					<RiskCriteriaSection
						criteriaFieldProps={criteriaFieldProps}
						getAvailableCriteriaValues={getAvailableCriteriaValues}
						isVisible={watchedValues.type === "CUSTOMER"}
					/>

					<PSPConfigurationSection pspsProps={basicFieldProps.pspsProps} />
				</Stack>
			</form>
		</Box>
	);
};

export default RiskRuleForm;
