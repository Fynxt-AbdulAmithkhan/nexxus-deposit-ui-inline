import { Box, Tabs } from "@chakra-ui/react";
import type { ReactElement } from "react";
import { useState } from "react";
import type { TabsProps } from "./tabs.type";

export const CustomTabs = ({
	items,
	defaultActiveTab,
	activeTab: controlledActiveTab,
	onTabChange,
	variant = "default",
	size = "md",
	className = "",
	tabListClassName = "",
	tabClassName = "",
	activeTabClassName = "",
	contentClassName = "",
	stickyHeader = false,
	fullHeight = false,
}: TabsProps): ReactElement => {
	const [internalActiveTab, setInternalActiveTab] = useState<string>(
		defaultActiveTab || items[0]?.id || "",
	);

	const activeTab = controlledActiveTab || internalActiveTab;

	const getChakraVariant = () => {
		switch (variant) {
			case "pills":
				return "enclosed";
			case "underline":
				return "line";
			default:
				return "line";
		}
	};

	const getChakraSize = () => {
		switch (size) {
			case "sm":
				return "sm";
			case "lg":
				return "lg";
			default:
				return "md";
		}
	};

	const handleTabChange = (details: { value: string }): void => {
		const selectedTabId = details.value;
		if (selectedTabId) {
			if (!controlledActiveTab) {
				setInternalActiveTab(selectedTabId);
			}
			onTabChange?.(selectedTabId);
		}
	};

	if (stickyHeader && fullHeight) {
		// Sticky header layout with proper separation
		return (
			<Box
				className={className}
				display="flex"
				flexDirection="column"
				height="full"
				position="relative"
				width="full"
			>
				{/* Sticky Header - Tabs */}
				<Box
					bg="background.subtle"
					borderBottom="1px solid"
					borderColor="secondary.solid"
					flexShrink={0}
					position="sticky"
					top={0}
					zIndex={1}
				>
					<Tabs.Root
						onValueChange={handleTabChange}
						size={getChakraSize()}
						value={activeTab}
						variant={getChakraVariant()}
					>
						<Tabs.List className={tabListClassName}>
							{items.map((item) => (
								<Tabs.Trigger
									_selected={{
										borderColor: "border.subtle",
										color: "text.subtle",
									}}
									className={`${tabClassName} ${
										item.id === activeTab ? activeTabClassName : ""
									}`}
									disabled={item.disabled}
									key={item.id}
									value={item.id}
								>
									{item.label}
								</Tabs.Trigger>
							))}
						</Tabs.List>
					</Tabs.Root>
				</Box>

				{/* Scrollable Content Body */}
				<Box
					className={`${contentClassName} custom-scrollbar`}
					flex={1}
					overflow="auto"
					p={4}
					position="relative"
					pr={6}
					zIndex={1}
				>
					<Tabs.Root
						onValueChange={handleTabChange}
						size={getChakraSize()}
						value={activeTab}
						variant={getChakraVariant()}
					>
						<Tabs.ContentGroup>
							{items.map((item) => (
								<Tabs.Content key={item.id} mt={4} p={0} value={item.id}>
									{item.content}
								</Tabs.Content>
							))}
						</Tabs.ContentGroup>
					</Tabs.Root>
				</Box>
			</Box>
		);
	}

	// Regular layout without sticky header
	return (
		<Box
			className={className}
			display="flex"
			flexDirection="column"
			height={fullHeight ? "full" : "auto"}
			width="full"
		>
			{/* Regular Header - Tabs */}
			<Box bg="transparent" flexShrink={0}>
				<Tabs.Root
					onValueChange={handleTabChange}
					size={getChakraSize()}
					value={activeTab}
					variant={getChakraVariant()}
				>
					<Tabs.List className={tabListClassName}>
						{items.map((item) => (
							<Tabs.Trigger
								_before={{
									backgroundColor: "secondary.solid",
								}}
								_selected={{
									color: "primary.solid",
								}}
								className={`${tabClassName} ${
									item.id === activeTab ? activeTabClassName : ""
								}`}
								disabled={item.disabled}
								key={item.id}
								value={item.id}
							>
								{item.label}
							</Tabs.Trigger>
						))}
					</Tabs.List>
				</Tabs.Root>
			</Box>

			{/* Content Body */}
			<Box
				className={`${contentClassName} custom-scrollbar`}
				flex={fullHeight ? 1 : "none"}
				height={fullHeight ? "full" : "auto"}
				overflow={fullHeight ? "auto" : "visible"}
				p={4}
				pr={6}
			>
				<Tabs.Root
					onValueChange={handleTabChange}
					size={getChakraSize()}
					value={activeTab}
					variant={getChakraVariant()}
				>
					<Tabs.ContentGroup>
						{items.map((item) => (
							<Tabs.Content key={item.id} mt={4} p={0} value={item.id}>
								{item.content}
							</Tabs.Content>
						))}
					</Tabs.ContentGroup>
				</Tabs.Root>
			</Box>
		</Box>
	);
};

export default CustomTabs;
