import { Box, Heading, HStack } from "@chakra-ui/react";
import type { RoutingRuleFormValues } from "../hooks/use-routing-form";
import PriorityRoutingOrder from "../priority-routing-order";
import WeightageRoutingOrder from "../weightage-routing-order";

interface RoutingOrderSectionProps {
	routingMethod: "WEIGHTAGE" | "PRIORITY";
	priorityPsps: Array<{ id: string; pspId: string }>;
	weightagePsps: Array<{ id: string; pspId: string; pspValue: number }>;
	pspOptions: Array<{ label: string; value: string }>;
	pspErrors: Record<string, string>;
	watchedValues: RoutingRuleFormValues;
	onPriorityPspsChange: (psps: Array<{ id: string; pspId: string }>) => void;
	onWeightagePspsChange: (
		psps: Array<{ id: string; pspId: string; pspValue: number }>,
	) => void;
	onValidatePSP: (pspId: string, currentId: string) => boolean;
}

const RoutingOrderSection: React.FC<RoutingOrderSectionProps> = ({
	routingMethod,
	priorityPsps,
	weightagePsps,
	pspOptions,
	pspErrors,
	watchedValues,
	onPriorityPspsChange,
	onWeightagePspsChange,
	onValidatePSP,
}) => {
	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<HStack gap={3} mb={6}>
				<Heading color="fg" fontWeight="regular" size="md">
					Routing Order
				</Heading>
			</HStack>

			{routingMethod === "PRIORITY" ? (
				<PriorityRoutingOrder
					errors={pspErrors}
					onPspsChange={onPriorityPspsChange}
					onValidatePSP={onValidatePSP}
					pspOptions={pspOptions}
					psps={priorityPsps}
				/>
			) : (
				<WeightageRoutingOrder
					onPspsChange={onWeightagePspsChange}
					pspOptions={pspOptions}
					psps={weightagePsps}
					ruleType={watchedValues.rule}
				/>
			)}
		</Box>
	);
};

export default RoutingOrderSection;
