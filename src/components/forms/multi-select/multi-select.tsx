/** biome-ignore-all lint/suspicious/noExplicitAny: <any> */
import {
	Box,
	createListCollection,
	Field,
	HStack,
	Select,
	Text,
} from "@chakra-ui/react";
import type React from "react";
import type { ReactElement } from "react";
import { startTransition, useCallback, useEffect, useState } from "react";
import BadgeList from "@/components/ui/BadgeList/badge-list";
import { Icon } from "@/components/ui/Icon/icon";
import { I18nTooltip } from "@/components/ui/Tooltip/i18n-tooltip";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";
import Input from "../input";

export type MultiSelectOption = {
	value: string;
	label: string;
	icon?: string;
};

export type MultiSelectProps = {
	label?: string;
	size?: "sm" | "md" | "lg";
	isDisabled?: boolean;
	isInvalid?: boolean;
	value?: string[];
	options: MultiSelectOption[];
	onChange?: (values: string[]) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	placeholder?: string;
	maxVisible?: number;
	showSearch?: boolean;
	showRemoveIcon?: boolean;
	showSelectAll?: boolean;
	errorMessage?: string;
	borderColor?: string;
	required?: boolean;
	shouldFloat?: boolean;
	tooltip?: string;
	i18nTooltip?: {
		translationKey: string;
		fallbackText?: string;
		translationParams?: Record<string, string | number>;
	};
	name?: string;
	ref?: React.Ref<HTMLSelectElement>;
	[key: string]: any;
};

const MultiSelect = ({
	label = "",
	size = "sm",
	options,
	value,
	onChange,
	onBlur,
	isDisabled,
	isInvalid,
	placeholder = "Select options...",
	maxVisible = 3,
	showSearch = false,
	showRemoveIcon = true,
	showSelectAll = false,
	errorMessage,
	required = false,
	shouldFloat = true,
	tooltip,
	i18nTooltip,
	name,
	ref,
	...restProps
}: MultiSelectProps): ReactElement => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isClient, setIsClient] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Prevent hydration mismatches by ensuring client-side rendering
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Clear search query when dropdown closes
	useEffect(() => {
		if (!isOpen) {
			setSearchQuery("");
		}
	}, [isOpen]);

	// Filter out invalid values that don't exist in options
	const validValue =
		value?.filter((val) => options.some((option) => option.value === val)) ||
		[];

	// Update form if invalid values were filtered out
	useEffect(() => {
		if (value && validValue.length !== value.length && onChange) {
			onChange(validValue);
		}
	}, [value, validValue, onChange]);

	const handleRemove = useCallback(
		(valueToRemove: string) => {
			if (value && onChange) {
				// Use startTransition to mark this as a non-urgent update
				startTransition(() => {
					onChange(value.filter((v) => v !== valueToRemove));
				});
			}
		},
		[value, onChange],
	);

	const filteredOptions = showSearch
		? options.filter((option) =>
				option.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: options;

	// Check if all filtered options are selected
	const areAllFilteredOptionsSelected =
		showSelectAll &&
		filteredOptions.length > 0 &&
		validValue.length > 0 &&
		filteredOptions.every((option) => validValue.includes(option.value));

	// Handle select all functionality
	const handleSelectAll = useCallback(() => {
		if (!onChange) {
			return;
		}

		if (areAllFilteredOptionsSelected) {
			// Deselect all filtered options
			const unselectedValues =
				value?.filter(
					(val) => !filteredOptions.some((option) => option.value === val),
				) || [];
			onChange(unselectedValues);
		} else {
			// Select all filtered options
			const filteredValues = filteredOptions.map((option) => option.value);
			const existingValues = value || [];
			const mergedValues = Array.from(
				new Set([...existingValues, ...filteredValues]),
			);
			onChange(mergedValues);
		}
	}, [areAllFilteredOptionsSelected, filteredOptions, onChange, value]);

	// Select all option
	const selectAllOption: MultiSelectOption = {
		value: "__SELECT_ALL__",
		label: "Select All",
	};

	// Add select all option to filtered options if enabled
	const displayOptions = showSelectAll
		? [selectAllOption, ...filteredOptions]
		: filteredOptions;

	return (
		<Field.Root invalid={isInvalid || !!errorMessage}>
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

				<HStack align="center" gap={3}>
					<Box flex="1">
						<Select.Root
							{...restProps}
							collection={createListCollection({ items: displayOptions })}
							disabled={isDisabled}
							multiple
							name={name}
							onBlur={onBlur}
							onOpenChange={(e) => setIsOpen(e.open)}
							onValueChange={(e) => {
								// Handle select all option
								if (e.value.includes("__SELECT_ALL__")) {
									handleSelectAll();
								} else {
									onChange?.(e.value);
								}
								setSearchQuery("");
							}}
							positioning={{
								strategy: "fixed",
								hideWhenDetached: true,
								sameWidth: true,
							}}
							scrollToIndexFn={() => {
								return;
							}}
							size={size}
							value={value || []}
						>
							<Select.HiddenSelect ref={ref} required={false} />

							<Select.Control>
								<Select.Trigger bg="bg.muted">
									{isClient && validValue && validValue.length > 0 ? (
										<BadgeList
											items={validValue.map((val) => {
												const option = options.find((opt) => opt.value === val);
												return {
													value: val,
													label: option?.label || val,
													icon: option?.icon,
												};
											})}
											maxVisible={maxVisible}
											onRemove={handleRemove}
											showRemoveIcon={showRemoveIcon}
										/>
									) : (
										<Select.ValueText placeholder={placeholder} />
									)}
								</Select.Trigger>
								<Select.IndicatorGroup>
									<Select.Indicator />
								</Select.IndicatorGroup>
							</Select.Control>

							<Select.Positioner>
								<Select.Content maxHeight="200px" overflowY="auto" p={0}>
									{showSearch && (
										<Box
											bg="bg"
											borderBottom="1px"
											borderColor="border.subtle"
											p={2}
											position="sticky"
											top={0}
											zIndex={10}
										>
											<Input
												bg="bg.muted"
												borderColor="border"
												color="fg"
												onChange={(s: string) => setSearchQuery(s)}
												placeholder="Search options..."
												size="sm"
												value={searchQuery}
											/>
										</Box>
									)}
									{displayOptions.map((option) => {
										const isSelectAllOption = option.value === "__SELECT_ALL__";
										const isSelected = isSelectAllOption
											? areAllFilteredOptionsSelected
											: validValue?.includes(option.value);

										// Skip rendering the select all option in the normal list if it's being handled
										if (isSelectAllOption) {
											return (
												<Select.Item
													bg={isSelected ? "secondary.subtle" : ""}
													borderBottom="1px"
													borderColor="border.subtle"
													color={isSelected ? "secondary.solid" : "inherit"}
													fontWeight={isSelected ? "semibold" : "bold"}
													item={option}
													key={option.value}
												>
													<Tooltip
														content="Select all options"
														key={option.value}
													>
														<HStack gap={2} w="full">
															{/* <Icon
                                color={isSelected ? 'blue.600' : 'fg.muted'}
                                name={isSelected ? 'square-check' : 'square'}
                                size="sm"
                              /> */}
															<Text
																fontWeight={isSelected ? "semibold" : "bold"}
																minW={0}
																overflow="hidden"
																textOverflow="ellipsis"
																w="full"
																whiteSpace="nowrap"
															>
																{option.label}
															</Text>
														</HStack>
													</Tooltip>
												</Select.Item>
											);
										}

										return (
											<Select.Item
												bg={isSelected ? "secondary.subtle" : ""}
												color={isSelected ? "secondary.solid" : "inherit"}
												fontWeight={isSelected ? "semibold" : "normal"}
												item={option}
												key={option.value}
											>
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
												{isSelected && (
													<Box ml="auto">
														<Icon color="blue.600" name="check" size="sm" />
													</Box>
												)}
											</Select.Item>
										);
									})}
								</Select.Content>
							</Select.Positioner>
						</Select.Root>
					</Box>
				</HStack>
			</Box>

			{errorMessage && (
				<Field.ErrorText color="red.500" fontSize="xs">
					{errorMessage}
				</Field.ErrorText>
			)}
		</Field.Root>
	);
};

export default MultiSelect;
