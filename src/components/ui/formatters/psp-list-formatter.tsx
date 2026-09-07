import { Badge, HStack, Text } from "@chakra-ui/react";
import type React from "react";
import { Tooltip } from "@/components/ui";

interface PSP {
	id: string;
	name: string;
}

interface PSPListFormatterProps {
	psps: PSP[];
	maxVisible?: number;
}

export const PSPListFormatter: React.FC<PSPListFormatterProps> = ({
	psps,
	maxVisible = 3,
}) => {
	const visiblePSPs = psps.slice(0, maxVisible);
	const remainingCount = psps.length - maxVisible;

	return (
		<HStack gap={1} wrap="wrap">
			{visiblePSPs.map((psp) => (
				<Tooltip content={psp.name} key={psp.id}>
					<Badge
						bg="secondary.subtle"
						color="secondary.solid"
						fontSize="xs"
						fontWeight="normal"
						maxWidth="120px"
					>
						<Text
							minW={0}
							overflow="hidden"
							textOverflow="ellipsis"
							w="full"
							whiteSpace="nowrap"
						>
							{psp.name}
						</Text>
					</Badge>
				</Tooltip>
			))}
			{remainingCount > 0 && (
				<Badge
					bg="secondary.subtle"
					color="secondary.solid"
					fontSize="xs"
					fontWeight="normal"
					variant="subtle"
				>
					+{remainingCount}
				</Badge>
			)}
		</HStack>
	);
};
