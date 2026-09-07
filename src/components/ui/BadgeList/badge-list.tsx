import { HStack, Tag } from "@chakra-ui/react";
import type { ReactElement } from "react";
import { Icon } from "@/components/ui/Icon/icon";
import { Tooltip } from "../Tooltip";

export type BadgeItem = {
	value: string;
	label: string;
	icon?: string;
};

export type BadgeListProps = {
	items: BadgeItem[];
	maxVisible?: number;
	onRemove?: (value: string) => void;
	showRemoveIcon?: boolean;
};

// Color palette for consistent badge colors
const COLOR_PALETTE = [
	{ bg: "red.100", text: "red.700" },
	{ bg: "blue.100", text: "blue.700" },
	{ bg: "green.100", text: "green.700" },
	{ bg: "purple.100", text: "purple.700" },
	{ bg: "orange.100", text: "orange.700" },
	{ bg: "pink.100", text: "pink.700" },
	{ bg: "teal.100", text: "teal.700" },
	{ bg: "cyan.100", text: "cyan.700" },
	{ bg: "yellow.100", text: "yellow.700" },
] as const;

export const getRandomColor = (str: string) => {
	// Optimized hash function for consistent color assignment
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = hash * 31 + str.charCodeAt(i);
	}

	// Use absolute value and modulo for array index
	const index = Math.abs(hash) % COLOR_PALETTE.length;
	return COLOR_PALETTE[index];
};

const BadgeList = ({
	items,
	maxVisible = 3,
	onRemove,
	showRemoveIcon = true,
}: BadgeListProps): ReactElement => {
	return (
		<HStack flexWrap="wrap" gap={1} p={0.5}>
			{items.slice(0, maxVisible).map((item) => {
				return (
					<Tooltip content={item.label} key={item.value}>
						<Tag.Root
							bg={getRandomColor(item.value).bg}
							color={getRandomColor(item.value).text}
							key={item.value}
							maxWidth="120px"
							size="sm"
							variant="subtle"
						>
							{item.icon && (
								<Tag.StartElement>
									<Icon name={item.icon} size="xs" />
								</Tag.StartElement>
							)}
							<Tag.Label
								minW={0}
								overflow="hidden"
								textOverflow="ellipsis"
								w="full"
								whiteSpace="nowrap"
							>
								{item.label}
							</Tag.Label>
							{showRemoveIcon && onRemove && (
								<Tag.EndElement>
									<Tag.CloseTrigger
										aria-label="Remove"
										as="span"
										cursor="pointer"
										onClick={() => onRemove(item.value)}
									/>
								</Tag.EndElement>
							)}
						</Tag.Root>
					</Tooltip>
				);
			})}
			{items.length > maxVisible && (
				<Tag.Root bg="gray.100" color="gray.700" size="sm" variant="subtle">
					<Tag.Label>+{items.length - maxVisible} more</Tag.Label>
				</Tag.Root>
			)}
		</HStack>
	);
};

export default BadgeList;
