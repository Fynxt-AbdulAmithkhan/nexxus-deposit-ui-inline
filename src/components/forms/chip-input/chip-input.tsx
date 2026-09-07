import {
	Badge,
	Box,
	Input as ChakraInput,
	Field,
	Flex,
	IconButton,
	Text,
} from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { Icon } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";

interface ChipInputProps {
	value: string[];
	onChange: (values: string[]) => void;
	onValidate?: (value: string) => boolean;
	placeholder?: string;
	disabled?: boolean;
	errorMessage?: string;
	helpText?: string;
	label?: string;
	labelTooltip?: string;
}

export default function ChipInput({
	value = [],
	onChange,
	onValidate,
	placeholder,
	disabled = false,
	errorMessage,
	helpText,
	label,
	labelTooltip,
}: ChipInputProps): React.JSX.Element {
	const [inputValue, setInputValue] = useState("");
	const [tempChips, setTempChips] = useState<string[]>([]);
	const [currentError, setCurrentError] = useState<string | undefined>(
		undefined,
	);
	const inputRef = useRef<HTMLInputElement>(null);

	const addTempChip = useCallback(
		(chipValue: string) => {
			const trimmedValue = chipValue.trim();
			if (!trimmedValue) {
				return;
			}

			// Check for duplicates in both temp and final values
			if (tempChips.includes(trimmedValue) || value.includes(trimmedValue)) {
				setCurrentError("This IP address already exists");
				setTimeout(() => setCurrentError(undefined), 2000);
				return;
			}

			// Validate if validation function is provided
			if (onValidate && !onValidate(trimmedValue)) {
				setCurrentError("Invalid IP address format");
				setTimeout(() => setCurrentError(undefined), 2000);
				return;
			}

			setTempChips((prev) => [...prev, trimmedValue]);
			setInputValue("");
			setCurrentError(undefined);
		},
		[tempChips, value, onValidate],
	);

	const removeTempChip = useCallback((index: number) => {
		setTempChips((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const removeChip = useCallback(
		(index: number) => {
			const newValues = value.filter((_, i) => i !== index);
			onChange(newValues);
		},
		[value, onChange],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === ",") {
				e.preventDefault();
				addTempChip(inputValue);
			} else if (e.key === "Enter") {
				e.preventDefault();
				const trimmedValue = inputValue.trim();

				// Build the final list to commit
				const finalChips = [...tempChips];

				// Add current input if valid
				if (trimmedValue) {
					// Check for duplicates
					const isDuplicate =
						tempChips.includes(trimmedValue) || value.includes(trimmedValue);
					if (isDuplicate) {
						setCurrentError("This IP address already exists");
						setTimeout(() => setCurrentError(undefined), 2000);
						return;
					}

					// Validate if validation function is provided
					const isValid = !onValidate || onValidate(trimmedValue);
					if (!isValid) {
						setCurrentError("Invalid IP address format");
						setTimeout(() => setCurrentError(undefined), 2000);
						return;
					}

					finalChips.push(trimmedValue);
				}

				// Commit all chips at once
				if (finalChips.length > 0) {
					onChange([...value, ...finalChips]);
					setTempChips([]);
					setInputValue("");
					setCurrentError(undefined);
				}
			}
		},
		[inputValue, tempChips, value, onValidate, onChange, addTempChip],
	);

	const handleAddClick = useCallback(() => {
		const trimmedValue = inputValue.trim();

		// Build the final list to commit
		const finalChips = [...tempChips];

		// Add current input if valid
		if (trimmedValue) {
			// Check for duplicates
			const isDuplicate =
				tempChips.includes(trimmedValue) || value.includes(trimmedValue);
			if (isDuplicate) {
				setCurrentError("This IP address already exists");
				setTimeout(() => setCurrentError(undefined), 2000);
				return;
			}

			// Validate if validation function is provided
			const isValid = !onValidate || onValidate(trimmedValue);
			if (!isValid) {
				setCurrentError("Invalid IP address format");
				setTimeout(() => setCurrentError(undefined), 2000);
				return;
			}

			finalChips.push(trimmedValue);
		}

		// Commit all chips at once
		if (finalChips.length > 0) {
			onChange([...value, ...finalChips]);
			setTempChips([]);
			setInputValue("");
			setCurrentError(undefined);
		}
	}, [inputValue, tempChips, value, onValidate, onChange]);

	const canAdd = tempChips.length > 0 || inputValue.trim() !== "";

	const hasError = Boolean(currentError || errorMessage);
	const shouldFloat = true;

	return (
		<Field.Root invalid={hasError}>
			{/* Input Field with Floating Label */}
			<Box pos="relative" w="full">
				{label && (
					<Field.Label
						color={hasError ? "red !important" : "fg.muted"}
						css={floatingLabelStyles}
						data-float={shouldFloat}
					>
						{label}
						{labelTooltip && (
							<Tooltip content={labelTooltip}>
								<Box as="span" display="inline-flex">
									<Icon
										color="gray.500"
										name="circle-info"
										prefix="far"
										size="sm"
									/>
								</Box>
							</Tooltip>
						)}
					</Field.Label>
				)}

				<Flex
					_focusWithin={{
						borderColor: hasError ? "red.500" : "blue.500",
						boxShadow: hasError
							? "0 0 0 1px var(--chakra-colors-red-500)"
							: "0 0 0 1px var(--chakra-colors-blue-500)",
					}}
					align="center"
					bg="bg.muted"
					border="1px solid"
					borderColor={hasError ? "red.500" : "border"}
					borderRadius="md"
					flexWrap="wrap"
					gap={2}
					minH="40px"
					pr="40px"
					ps={2}
					transition="border-color 0.2s"
				>
					{/* Temp Chips - Shows badges inside input after comma */}
					{tempChips.map((chip, index) => (
						<Badge
							alignItems="center"
							bg="white"
							border="1px solid"
							borderColor="gray.300"
							borderRadius="md"
							color="gray.700"
							display="flex"
							fontSize="xs"
							gap={2}
							key={chip}
							px={3}
							py={2}
						>
							<Text fontFamily="monospace">{chip}</Text>
							<IconButton
								_hover={{
									bg: "transparent",
									color: "red.500",
								}}
								aria-label={`Remove ${chip}`}
								color="gray.500"
								disabled={disabled}
								h="auto"
								minW="auto"
								onClick={() => removeTempChip(index)}
								p={0}
								size="xs"
								variant="ghost"
							>
								<Icon name="times" size="xs" />
							</IconButton>
						</Badge>
					))}

					{/* Input */}
					<ChakraInput
						_focus={{
							boxShadow: "none",
							outline: "none",
						}}
						border="none"
						disabled={disabled}
						flex="1"
						fontSize="sm"
						minW="120px"
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={handleKeyDown}
						p={0}
						placeholder={tempChips.length === 0 ? placeholder : ""}
						ref={inputRef}
						value={inputValue}
					/>
				</Flex>

				{/* Add Button - Positioned on the right */}
				<IconButton
					_hover={{
						bg: canAdd ? "gray.100" : "transparent",
					}}
					aria-label="Add IP"
					color={canAdd ? "gray.700" : "gray.400"}
					cursor={canAdd ? "pointer" : "not-allowed"}
					disabled={disabled || !canAdd}
					h="auto"
					minW="auto"
					onClick={handleAddClick}
					p={2}
					position="absolute"
					right="8px"
					size="sm"
					top="50%"
					transform="translateY(-50%)"
					variant="ghost"
				>
					<Icon name="plus" size="sm" />
				</IconButton>
			</Box>

			{/* Help Text */}
			{helpText && !hasError && (
				<Field.HelperText color="fg.muted" fontSize="xs">
					{helpText}
				</Field.HelperText>
			)}

			{/* Error Message */}
			{(errorMessage || currentError) && (
				<Field.ErrorText color="red.500" fontSize="xs">
					{currentError || errorMessage}
				</Field.ErrorText>
			)}

			{/* Badge List Below Input */}
			{value.length > 0 && (
				<Flex flexWrap="wrap" gap={2} mt={3}>
					{value.map((chip, index) => (
						<Badge
							alignItems="center"
							bg="white"
							border="1px solid"
							borderColor="gray.300"
							borderRadius="md"
							color="gray.700"
							display="flex"
							fontSize="xs"
							gap={2}
							key={chip}
							px={3}
							py={2}
						>
							<Text fontFamily="monospace">{chip}</Text>
							<IconButton
								_hover={{
									bg: "transparent",
									color: "red.500",
								}}
								aria-label={`Remove ${chip}`}
								color="gray.500"
								disabled={disabled}
								h="auto"
								minW="auto"
								onClick={() => removeChip(index)}
								p={0}
								size="xs"
								variant="ghost"
							>
								<Icon name="times" size="xs" />
							</IconButton>
						</Badge>
					))}
				</Flex>
			)}
		</Field.Root>
	);
}
