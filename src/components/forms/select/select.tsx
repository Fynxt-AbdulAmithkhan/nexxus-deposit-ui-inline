/** biome-ignore-all lint/suspicious/noExplicitAny: <any> */
import {
	Box,
	Select as ChakraSelect,
	createListCollection,
	Field,
	HStack,
	Text,
} from "@chakra-ui/react";
import type React from "react";
import type { ReactElement } from "react";
import { useState } from "react";
import { Icon } from "@/components/ui";
import type { IconProps } from "@/components/ui/Icon/icon.type";
import { I18nTooltip } from "@/components/ui/Tooltip/i18n-tooltip";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";
import Input from "../input";

export type SelectOption = {
	value: string;
	label: string;
};

export type SelectProps = {
	label?: string;
	size?: "sm" | "md" | "lg" | "xs";
	isDisabled?: boolean;
	isInvalid?: boolean;
	value?: string;
	options: SelectOption[];
	onChange?: (value: string) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	placeholder?: string;
	showSearch?: boolean;
	leftIcon?: {
		name: string;
		prefix?: IconProps["prefix"];
	};
	rightIcon?: {
		name: string;
		prefix?: IconProps["prefix"];
	};
	errorMessage?: string;
	borderColor?: string;
	required?: boolean;
	color?: string;
	fontWeight?: string;
	actionButton?: ReactElement;
	shouldFloat?: boolean;
	width?: string;
	tooltip?: string;
	i18nTooltip?: {
		translationKey: string;
		fallbackText?: string;
		translationParams?: Record<string, string | number>;
	};
	bg?: string;
	name?: string;
	ref?: React.Ref<HTMLSelectElement>;
	[key: string]: any;
};

const Select = ({
	label,
	size = "md",
	options,
	value,
	onChange,
	onBlur,
	isDisabled,
	isInvalid,
	placeholder = "ChakraSelect...",
	showSearch = false,
	leftIcon,
	rightIcon,
	errorMessage,
	borderColor,
	required = false,
	color,
	fontWeight,
	actionButton,
	shouldFloat = true,
	width,
	tooltip,
	i18nTooltip,
	bg,
	name,
	ref,
	...restProps
}: SelectProps): ReactElement => {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredOptions = showSearch
		? options.filter((option) =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: options;

	const renderIcon = (iconConfig: {
		name: string;
		prefix?: IconProps["prefix"];
	}) => <Icon name={iconConfig.name} prefix={iconConfig.prefix} />;

	return (
		<Field.Root invalid={isInvalid || !!errorMessage} width={width}>
			<Box pos="relative" w="full">
				{label && (
					<Field.Label
						color={isInvalid ? "red !important" : "fg.muted"}
						css={floatingLabelStyles}
						data-float={shouldFloat || undefined}
					>
						{label}
						{required && <span style={{ color: "red" }}> *</span>}
						{label &&
							(i18nTooltip ? (
								<I18nTooltip
									fallbackText={i18nTooltip.fallbackText || tooltip || label}
									translationKey={i18nTooltip.translationKey}
									translationParams={i18nTooltip.translationParams}
								>
									<Icon
										color="fg.muted"
										name="circle-info"
										prefix="far"
										size="sm"
									/>
								</I18nTooltip>
							) : (
								tooltip && (
									<Tooltip content={tooltip}>
										<Icon
											color="fg.muted"
											name="circle-info"
											prefix="far"
											size="sm"
										/>
									</Tooltip>
								)
							))}
					</Field.Label>
				)}

				<ChakraSelect.Root
					{...restProps}
					collection={createListCollection({ items: filteredOptions })}
					color={color}
					disabled={isDisabled}
					fontWeight={fontWeight}
					invalid={isInvalid || !!errorMessage}
					name={name}
					onBlur={onBlur}
					onValueChange={(e) => onChange?.(e.value[0] as string)}
					positioning={{
						strategy: "fixed",
						hideWhenDetached: true,
						sameWidth: true,
					}}
					size={size}
					value={value ? [value] : []}
				>
					<ChakraSelect.HiddenSelect ref={ref} required={false} />

					<ChakraSelect.Control>
						<ChakraSelect.Trigger
							bg={bg || "bg.muted"}
							borderColor={borderColor}
						>
							<HStack gap={2} width="100%">
								{leftIcon && renderIcon(leftIcon)}
								<Box flex="1" minW={0}>
									<ChakraSelect.ValueText
										minW={0}
										overflow="hidden"
										placeholder={placeholder}
										textOverflow="ellipsis"
										w="full"
										whiteSpace="nowrap"
									>
										{value
											? options.find((opt) => opt.value === value)?.label ||
												value
											: placeholder}
									</ChakraSelect.ValueText>
								</Box>
								{rightIcon && renderIcon(rightIcon)}
							</HStack>
						</ChakraSelect.Trigger>
						<ChakraSelect.IndicatorGroup>
							<ChakraSelect.Indicator />
						</ChakraSelect.IndicatorGroup>
					</ChakraSelect.Control>

					<ChakraSelect.Positioner>
						<ChakraSelect.Content maxHeight="200px" overflowY="auto">
							{showSearch && (
								<Box borderBottom="1px" borderColor="border.subtle" p={2}>
									<Input
										bg={bg || "bg.muted"}
										borderColor="border"
										color="fg"
										onChange={(s: string) => setSearchQuery(s)}
										placeholder="Search options..."
										size="sm"
										value={searchQuery}
									/>
								</Box>
							)}
							{!actionButton &&
								filteredOptions.map((option) => (
									<ChakraSelect.Item item={option} key={option.value}>
										<Tooltip content={option.label} key={option.value}>
											<Text
												minW={0}
												overflow="hidden"
												textOverflow="ellipsis"
												w="full"
												whiteSpace="nowrap"
											>
												{option.label}
											</Text>
										</Tooltip>
									</ChakraSelect.Item>
								))}
							{actionButton && (
								<>
									{filteredOptions.map((option) => (
										<ChakraSelect.Item
											_selected={{
												bg: "secondary.100",
												color: "secondary.solid",
												fontWeight: "medium",
											}}
											item={option}
											key={option.value}
										>
											{option.label} <Icon name="circle-check" />
										</ChakraSelect.Item>
									))}
									<Box borderColor="border.subtle" borderTop="1px" />
									<Box p={2}>{actionButton}</Box>
								</>
							)}
						</ChakraSelect.Content>
					</ChakraSelect.Positioner>
				</ChakraSelect.Root>
			</Box>

			{errorMessage && (
				<Field.ErrorText color="red.500" fontSize="xs">
					{errorMessage}
				</Field.ErrorText>
			)}
		</Field.Root>
	);
};

export default Select;
