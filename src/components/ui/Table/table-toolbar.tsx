import { Box, HStack, Input, VStack } from "@chakra-ui/react";
import { Icon } from "@/components/ui";
import type { TableToolbarProps } from "./table.types";

export function TableToolbar({
	globalSearchValue = "",
	onGlobalSearchChange,
	globalSearchPlaceholder = "Search...",
	showGlobalSearch = true,
	actions,
}: TableToolbarProps): React.JSX.Element {
	return (
		<Box borderBottom="1px" borderColor="border" py={4}>
			<VStack align="stretch" gap={4}>
				<HStack align="center" justify="space-between">
					{/* Left side - Search */}
					<HStack flex={1} gap={4}>
						{/* Global Search */}
						{showGlobalSearch && (
							<Box flex={1} maxW="400px" position="relative">
								<Box
									color="fg.subtle"
									left={2}
									pointerEvents="none"
									position="absolute"
									top="50%"
									transform="translateY(-50%)"
								>
									<Icon aria-hidden name="magnifying-glass" />
								</Box>
								<Input
									onChange={(e) => onGlobalSearchChange?.(e.target.value)}
									pl="32px"
									placeholder={globalSearchPlaceholder}
									size="md"
									value={globalSearchValue}
								/>
							</Box>
						)}
					</HStack>

					{/* Right side - Actions */}
					{actions && actions}
				</HStack>
			</VStack>
		</Box>
	);
}
