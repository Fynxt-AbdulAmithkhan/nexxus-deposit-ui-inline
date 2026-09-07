import { Box, Grid, Heading, HStack, Skeleton, Stack } from "@chakra-ui/react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import type { FlowAction } from "@/api/service.types";
import CommonInput from "@/components/forms/input";
import MultiSelect from "@/components/forms/multi-select/multi-select";
import { NumberInput } from "@/components/forms/number-input";
import CommonSelect from "@/components/forms/select/select";
import { useTransactionLimitForm } from "../hooks/use-transaction-limit-form";
import type { TransactionLimitFormData } from "../types";

/**
 * Interface for basic field props
 */
interface BasicFieldProps {
	nameProps: Record<string, unknown>;
	currencyProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	countriesProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	tagsProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
	pspsProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
}

/**
 * Interface for flow action field data
 */
interface FlowActionFieldData {
	action: FlowAction;
	minProps: Record<string, unknown>;
	maxProps: Record<string, unknown>;
	fieldName: string;
	minFieldName: string;
	maxFieldName: string;
}

/**
 * Props for BasicDetailsSection component
 */
interface BasicDetailsSectionProps {
	fieldProps: BasicFieldProps;
}

/**
 * Props for LimitsSection component
 */
interface LimitsSectionProps {
	flowActionFields: FlowActionFieldData[];
	isLoading: boolean;
}

/**
 * Props for PSPSection component
 */
interface PSPSectionProps {
	pspsProps: Record<string, unknown> & {
		options: Array<{ label: string; value: string }>;
	};
}

/**
 * Props for TransactionLimitFormRefactored component
 */
export interface TransactionLimitFormProps {
	initialData?: Partial<TransactionLimitFormData>;
	onSubmit: (data: TransactionLimitFormData) => void;
	mode: "create" | "edit";
	formId: string;
}

/**
 * Basic Details Section Component
 */
const BasicDetailsSection: React.FC<BasicDetailsSectionProps> = ({
	fieldProps,
}) => {
	const { t } = useTranslation();

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("transactionLimits.basicDetails")}
				</Heading>
			</HStack>
			<Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
				<CommonInput {...fieldProps.nameProps} />
				<CommonSelect {...fieldProps.currencyProps} />
				<MultiSelect {...fieldProps.countriesProps} />
				<MultiSelect {...fieldProps.tagsProps} />
			</Grid>
		</Box>
	);
};

/**
 * Limits Section Component
 */
const LimitsSection: React.FC<LimitsSectionProps> = ({
	flowActionFields,
	isLoading,
}) => {
	const { t } = useTranslation();

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("transactionLimits.limits")}
				</Heading>
			</HStack>

			{isLoading ? (
				<Skeleton height="100px" />
			) : (
				<Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
					{flowActionFields.map(({ action, minProps, maxProps }) => (
						<Fragment key={action.id}>
							<NumberInput {...minProps} />
							<NumberInput {...maxProps} />
						</Fragment>
					))}
				</Grid>
			)}
		</Box>
	);
};

/**
 * PSP Section Component
 */
const PSPSection: React.FC<PSPSectionProps> = ({ pspsProps }) => {
	const { t } = useTranslation();

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					{t("transactionLimits.psp")}
				</Heading>
			</HStack>
			<MultiSelect {...pspsProps} />
		</Box>
	);
};

const TransactionLimitFormRefactored: React.FC<TransactionLimitFormProps> = ({
	initialData,
	onSubmit,
	formId,
}) => {
	const { basicFieldProps, flowActionFields, isLoading, handleFormSubmit } =
		useTransactionLimitForm({
			initialData,
			onSubmit,
		});

	return (
		<Box>
			<form id={formId} onSubmit={handleFormSubmit}>
				<Stack gap={6}>
					<BasicDetailsSection fieldProps={basicFieldProps} />

					<LimitsSection
						flowActionFields={flowActionFields}
						isLoading={isLoading}
					/>

					<PSPSection pspsProps={basicFieldProps.pspsProps} />
				</Stack>
			</form>
		</Box>
	);
};

export default TransactionLimitFormRefactored;
