import {
	Box,
	Field,
	Grid,
	Heading,
	HStack,
	RadioGroup,
} from "@chakra-ui/react";
import type {
	FieldErrors,
	UseFormSetValue,
	UseFormWatch,
} from "react-hook-form";
import CommonInput from "@/components/forms/input";
import CommonSelect from "@/components/forms/select";
import type { RoutingRuleFormValues } from "../hooks/use-routing-form";

interface BasicInformationProps {
	setValue: UseFormSetValue<RoutingRuleFormValues>;
	watch: UseFormWatch<RoutingRuleFormValues>;
	errors: FieldErrors<RoutingRuleFormValues>;
	routingMethod: "WEIGHTAGE" | "PRIORITY";
	onRoutingMethodChange: () => void;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
	setValue,
	watch,
	errors,
	routingMethod,
	onRoutingMethodChange,
}) => {
	const watchedValues = watch();

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					Basic Information
				</Heading>
			</HStack>
			<Grid gap={6} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}>
				<CommonInput
					errorMessage={errors.name?.message}
					label="Name"
					onChange={(value: string) => setValue("name", value)}
					placeholder="Enter Name"
					required
					value={watchedValues.name}
				/>

				<Field.Root invalid={!!errors.routingMethod}>
					<Field.Label fontSize="2xs">Routing Method</Field.Label>
					<RadioGroup.Root
						onValueChange={(details) => {
							setValue(
								"routingMethod",
								details.value as "WEIGHTAGE" | "PRIORITY",
							);
							onRoutingMethodChange();
						}}
						value={routingMethod}
					>
						<HStack gap={4}>
							<RadioGroup.Item value="PRIORITY">
								<RadioGroup.ItemHiddenInput />
								<RadioGroup.ItemIndicator />
								<RadioGroup.ItemText>Priority</RadioGroup.ItemText>
							</RadioGroup.Item>
							<RadioGroup.Item value="WEIGHTAGE">
								<RadioGroup.ItemHiddenInput />
								<RadioGroup.ItemIndicator />
								<RadioGroup.ItemText>Weightage</RadioGroup.ItemText>
							</RadioGroup.Item>
						</HStack>
					</RadioGroup.Root>
					<Field.ErrorText>{errors.routingMethod?.message}</Field.ErrorText>
				</Field.Root>

				{routingMethod === "WEIGHTAGE" && (
					<CommonSelect
						errorMessage={errors.rule?.message}
						label="Rule"
						onChange={(value: string) =>
							setValue("rule", value as "COUNT" | "AMOUNT" | "PERCENTAGE")
						}
						options={[
							{ value: "COUNT", label: "Count" },
							{ value: "AMOUNT", label: "Amount" },
							{ value: "PERCENTAGE", label: "Percentage" },
						]}
						placeholder="Select rule"
						required
						value={watchedValues.rule || ""}
					/>
				)}

				{routingMethod === "WEIGHTAGE" && (
					<CommonSelect
						errorMessage={errors.time?.message}
						label="Time"
						onChange={(value: string) =>
							setValue("time", value as "HOUR" | "DAY" | "WEEK" | "MONTH")
						}
						options={[
							{ value: "HOUR", label: "Hourly" },
							{ value: "DAY", label: "Daily" },
							{ value: "WEEK", label: "Weekly" },
							{ value: "MONTH", label: "Monthly" },
						]}
						placeholder="Select time"
						required
						value={watchedValues.time || ""}
					/>
				)}
			</Grid>
		</Box>
	);
};

export default BasicInformation;
