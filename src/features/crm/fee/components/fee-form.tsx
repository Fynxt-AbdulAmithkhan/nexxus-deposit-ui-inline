import {
	Box,
	Button,
	Grid,
	Heading,
	HStack,
	IconButton,
	Skeleton,
	Stack,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import CommonInput from "@/components/forms/input/input";
import MultiSelect from "@/components/forms/multi-select/multi-select";
import { NumberInput } from "@/components/forms/number-input";
import CommonSelect from "@/components/forms/select/select";
import { useFeeForm } from "../hooks/use-fee-form";
import type { FeeFormProps } from "../types";
import { COMPONENT_TYPES } from "../types";

export function FeeForm({ initialData, onSubmit, mode, formId }: FeeFormProps) {
	const { t } = useTranslation();
	const {
		form,
		fieldProps,
		handleFormSubmit,
		isAllDataLoaded,
		availableTypes,
		addComponent,
		removeComponent,
		updateComponent,
	} = useFeeForm({
		initialData,
		onSubmit,
		mode,
	});

	// Watch components for component management
	const components = form.watch("components");

	// Show loading state while waiting for all required API data
	const isInitializing = initialData && !isAllDataLoaded;

	// Check if any field is currently loading
	const isAnyFieldLoading =
		fieldProps.isLoadingFlowActions ||
		fieldProps.isLoadingCurrencies ||
		fieldProps.isLoadingCountries;

	// Show full-screen loading when initializing or any field is loading
	if (isInitializing || isAnyFieldLoading) {
		return (
			<VStack align="stretch" gap={4} py={8}>
				<Skeleton height="40px" width="100%" />
				<Skeleton height="40px" width="100%" />
				<Skeleton height="40px" width="100%" />
				<Skeleton height="40px" width="100%" />
				<Skeleton height="200px" width="100%" />
				<Text color="gray.600" fontSize="sm" textAlign="center">
					{t("fees.modals.loadingFormData", "Loading form data...")}
				</Text>
			</VStack>
		);
	}

	const getComponentAvailableTypes = (
		excludeIndex?: number,
	): (typeof COMPONENT_TYPES)[number][] => {
		const usedTypes = new Set(
			components
				.map((comp, idx) => (idx === excludeIndex ? undefined : comp.type))
				.filter((type): type is (typeof COMPONENT_TYPES)[number] =>
					Boolean(type),
				),
		);
		return COMPONENT_TYPES.filter((type) => !usedTypes.has(type));
	};

	const getFeeUnit = (type: string): string => {
		if (type === "PERCENTAGE") {
			return "%";
		}
		return "$";
	};

	return (
		<Box>
			<form id={formId} onSubmit={handleFormSubmit}>
				<Stack gap={4}>
					{/* Basic Information Section */}
					<Box bg="bg.subtle" p={4} rounded="md">
						<HStack gap={3} mb={6}>
							<Heading color="fg" fontWeight="regular" size="md">
								{t("fees.form.basicInformation", "Basic Information")}
							</Heading>
						</HStack>
						<Grid
							gap={6}
							templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
						>
							{/* Name */}
							<CommonInput {...fieldProps.nameProps} />

							{/* Flow Action */}
							{fieldProps.hasFlowActionsError ? (
								<Box>
									<Text fontSize="sm" fontWeight="medium" mb={2}>
										{t("fees.form.action.label")}
									</Text>
									<Text color="fg.error" fontSize="sm">
										{t("fees.form.action.error", "Failed to load flow actions")}
									</Text>
								</Box>
							) : (
								<CommonSelect {...fieldProps.flowActionProps} />
							)}

							{/* Charge Fee Type */}
							<CommonSelect {...fieldProps.chargeFeeTypeProps} />

							{/* Currency */}
							{fieldProps.hasCurrenciesError ? (
								<Box>
									<Text fontSize="sm" fontWeight="medium" mb={2}>
										{t("fees.form.currency.label")}
									</Text>
									<Text color="fg.error" fontSize="sm">
										{t("fees.form.currency.error", "Failed to load currencies")}
									</Text>
								</Box>
							) : (
								<CommonSelect {...fieldProps.currencyProps} />
							)}

							{/* Countries */}
							{fieldProps.hasCountriesError ? (
								<Box>
									<Text fontSize="sm" fontWeight="medium" mb={2}>
										{t("fees.form.countries.label")}
									</Text>
									<Text color="fg.error" fontSize="sm">
										{t("fees.form.countries.error", "Failed to load countries")}
									</Text>
								</Box>
							) : (
								<MultiSelect {...fieldProps.countriesProps} />
							)}
						</Grid>
					</Box>

					{/* Fee Details Section */}
					<Box bg="bg.subtle" p={4} rounded="md">
						<HStack justify="space-between" mb={6}>
							<VStack align="start" gap={0}>
								<Heading color="fg" fontWeight="regular" size="md">
									{t("fees.form.feeDetails", "Fee Details")}
								</Heading>
								{form.formState.errors.components?.message &&
									components.length === 0 && (
										<Text color="fg.error" fontSize="sm">
											{form.formState.errors.components.message}
										</Text>
									)}
							</VStack>
							<Button
								onClick={() => {
									form.clearErrors("components");
									form.setValue("components", [], {
										shouldValidate: true,
										shouldDirty: true,
									});
								}}
								type="button"
								variant="ghost"
							>
								{t("common.clear", "Clear")}
							</Button>
						</HStack>

						<Stack gap={4}>
							{components.map((component, index) => (
								<Box
									bg="bg.subtle"
									borderColor="border"
									borderWidth="1px"
									key={`${component.type}-${index}`}
									p={4}
									rounded="md"
								>
									<Grid
										gap={2}
										templateColumns={{
											base: "1fr",
											md:
												component.type === "FIXED"
													? "1fr 1fr auto"
													: "1fr 1fr 1fr 1fr auto",
										}}
									>
										<CommonSelect
											label={t("fees.form.feeType", "Fee Type")}
											onChange={(value) =>
												updateComponent(index, "type", value)
											}
											options={[
												component.type,
												...getComponentAvailableTypes(index),
											]
												.filter((v, i, a) => a.indexOf(v) === i)
												.map((type) => ({ value: type, label: type }))}
											placeholder={t("fees.form.selectType", "Select type")}
											value={component.type}
										/>

										<NumberInput
											errorMessage={
												form.formState.errors.components?.[index]?.amount
													?.message
											}
											label={`${t("fees.form.fee", "Fee")} (${getFeeUnit(component.type)})`}
											min={0}
											onChange={(value: string) =>
												updateComponent(
													index,
													"amount",
													Number.parseFloat(value) || 0,
												)
											}
											placeholder={t("fees.form.enterAmount", "Enter amount")}
											required
											step={0.01}
											value={
												component.amount === 0
													? ""
													: component.amount.toString()
											}
										/>

										{/* Only show min/max fields for PERCENTAGE type */}
										{component.type === "PERCENTAGE" && (
											<>
												<NumberInput
													errorMessage={
														form.formState.errors.components?.[index]?.minValue
															?.message
													}
													label={`${t("fees.form.minimumFee", "Minimum Fee")} (${getFeeUnit(component.type)})`}
													min={0}
													onChange={(value: string) =>
														updateComponent(
															index,
															"minValue",
															value ? Number.parseFloat(value) : 0,
														)
													}
													placeholder={t("fees.form.minValue", "Min value")}
													step={0.01}
													value={
														component.minValue === 0 ||
														component.minValue === undefined
															? ""
															: component.minValue.toString()
													}
													width="full"
												/>

												<NumberInput
													errorMessage={
														form.formState.errors.components?.[index]?.maxValue
															?.message ||
														(component.maxValue !== 0 &&
														component.minValue !== 0 &&
														component.maxValue !== undefined &&
														component.minValue !== undefined &&
														component.maxValue <= component.minValue
															? t(
																	"fees.form.maxGreaterThanMin",
																	"Max must be greater than Min",
																)
															: undefined)
													}
													label={`${t("fees.form.maximumFee", "Maximum Fee")} (${getFeeUnit(component.type)})`}
													min={0}
													onChange={(value: string) =>
														updateComponent(
															index,
															"maxValue",
															value ? Number.parseFloat(value) : 0,
														)
													}
													placeholder={t("fees.form.maxValue", "Max value")}
													step={0.01}
													value={
														component.maxValue === 0 ||
														component.maxValue === undefined
															? ""
															: component.maxValue.toString()
													}
												/>
											</>
										)}

										<IconButton
											aria-label={t("fees.form.removeFee", "Remove fee")}
											color="fg.error"
											onClick={() => removeComponent(index)}
											variant="ghost"
											width="10%"
										>
											<Trash2 size={16} />
										</IconButton>
									</Grid>
								</Box>
							))}

							{availableTypes.length > 0 && (
								<Button
									onClick={addComponent}
									type="button"
									variant="ghost"
									width="fit-content"
								>
									{t("fees.form.addFee", "+ Add Fee")}
								</Button>
							)}
						</Stack>
					</Box>

					{/* PSP Configuration Section */}
					<Box bg="bg.subtle" p={4} rounded="md">
						<HStack gap={3} mb={6}>
							<Heading color="fg" fontWeight="regular" size="md">
								{t("fees.form.pspConfiguration", "PSP Configuration")}
							</Heading>
						</HStack>
						{fieldProps.hasPSPsError ? (
							<Box>
								<Text fontSize="sm" fontWeight="medium" mb={2}>
									{t("fees.form.psps.label")}
								</Text>
								<Text color="fg.error" fontSize="sm">
									{t("fees.form.psps.error", "Failed to load PSPs")}
								</Text>
							</Box>
						) : (
							<MultiSelect {...fieldProps.pspsProps} />
						)}
					</Box>
				</Stack>
			</form>
		</Box>
	);
}

export default FeeForm;
