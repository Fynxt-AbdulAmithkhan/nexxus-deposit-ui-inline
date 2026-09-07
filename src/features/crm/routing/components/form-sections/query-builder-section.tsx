import { Box, HStack, Separator, Text, VStack } from "@chakra-ui/react";
import { QueryBuilderChakra } from "@react-querybuilder/chakra";
import {
	QueryBuilder,
	type Field as QueryField,
	type RuleGroupTypeIC,
} from "react-querybuilder";
import { getControlElements, getInitialQuery } from "../form-helpers";
import "@/styles/query-builder.css";

interface QueryBuilderSectionProps {
	routingMethod: "WEIGHTAGE" | "PRIORITY";
	query: RuleGroupTypeIC;
	queryFieldsData: QueryField[];
	onQueryChange: (query: RuleGroupTypeIC) => void;
}

const QueryBuilderSection: React.FC<QueryBuilderSectionProps> = ({
	routingMethod,
	query,
	queryFieldsData,
	onQueryChange,
}) => {
	const handleClearAll = () => {
		const resetQuery = getInitialQuery(routingMethod);
		onQueryChange(resetQuery);
	};

	return (
		<Box bg="bg.subtle" p={4} rounded="md">
			<VStack align="stretch" gap={2}>
				<HStack justify="space-between" mb={4}>
					<Text color="fg.muted" fontSize="sm">
						{" Create groups and choose conditions under the groups"}
					</Text>
					<Text
						color="blue.500"
						cursor="pointer"
						fontSize="sm"
						onClick={handleClearAll}
					>
						Clear all
					</Text>
				</HStack>
				<Separator />

				<Box>
					<QueryBuilderChakra key={routingMethod}>
						<QueryBuilder
							addRuleToNewGroups
							controlClassnames={{
								queryBuilder: "query-builder-custom",
							}}
							controlElements={getControlElements(routingMethod)}
							fields={queryFieldsData}
							onQueryChange={onQueryChange}
							query={query}
							resetOnOperatorChange
							showCombinatorsBetweenRules
						/>
					</QueryBuilderChakra>
				</Box>
			</VStack>
		</Box>
	);
};

export default QueryBuilderSection;
