/** biome-ignore-all lint/suspicious/noExplicitAny: <complex> */
import {
	Box,
	NumberInput as ChakraNumberInput,
	type InputProps as ChakraNumberInputProps,
	Field,
	InputGroup,
} from "@chakra-ui/react";
import type { ReactElement } from "react";
import { Icon } from "@/components/ui";
import { I18nTooltip } from "@/components/ui/Tooltip/i18n-tooltip";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";

export type NumberInputProps = {
	label?: string;
	size?: "sm" | "md" | "lg" | "xs";
	isDisabled?: boolean;
	isInvalid?: boolean;
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	name?: string;
	ref?: React.Ref<HTMLInputElement>;
	placeholder?: string;
	min?: number;
	max?: number;
	step?: number;
	errorMessage?: string;
	required?: boolean;
	readOnly?: boolean;
	autoFocus?: boolean;
	helpText?: string;
	shouldFloat?: boolean;
	width?: string | number;
	startAddon?: string | ReactElement;
	endAddon?: string | ReactElement;
	tooltip?: string;
	i18nTooltip?: {
		translationKey: string;
		fallbackText?: string;
		translationParams?: Record<string, string | number>;
	};
	defaultValue?: string;
	allowDecimals?: boolean;
	[key: string]: ChakraNumberInputProps[keyof ChakraNumberInputProps];
};

const NumberInput = ({
	label,
	size = "md",
	value,
	onChange,
	onBlur,
	name,
	ref,
	isDisabled,
	isInvalid,
	placeholder,
	min,
	max,
	step,
	errorMessage,
	required = false,
	readOnly = false,
	autoFocus = false,
	helpText,
	shouldFloat = true,
	width,
	startAddon,
	endAddon,
	tooltip,
	i18nTooltip,
	defaultValue,
	allowDecimals = true,
}: NumberInputProps): ReactElement => {
	return (
		<Field.Root invalid={isInvalid || !!errorMessage}>
			<Box pos="relative" w={width || "full"}>
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
								<Tooltip content={tooltip || label}>
									<Icon
										color="fg.muted"
										name="circle-info"
										prefix="far"
										size="sm"
									/>
								</Tooltip>
							))}
					</Field.Label>
				)}

				{startAddon || endAddon ? (
					<InputGroup endAddon={endAddon} startAddon={startAddon}>
						<ChakraNumberInput.Root
							defaultValue={defaultValue}
							disabled={isDisabled}
							max={max}
							min={min}
							onValueChange={(details) => onChange?.(details.value)}
							size={size}
							step={step}
							value={value || ""}
						>
							<ChakraNumberInput.Control />
							<ChakraNumberInput.Input
								_disabled={{
									opacity: 0.6,
									cursor: "not-allowed",
								}}
								_placeholder={{ color: "fg.muted", opacity: 0.8 }}
								_readOnly={{
									cursor: "default",
								}}
								autoFocus={autoFocus}
								bg="bg.muted"
								color="fg"
								name={name}
								onBlur={onBlur}
								onKeyDown={(e) => {
									if (!allowDecimals && e.key === ".") {
										e.preventDefault();
									}
								}}
								placeholder={placeholder}
								readOnly={readOnly}
								ref={ref}
							/>
						</ChakraNumberInput.Root>
					</InputGroup>
				) : (
					<ChakraNumberInput.Root
						disabled={isDisabled}
						max={max}
						min={min}
						onValueChange={(details) => onChange?.(details.value)}
						size={size}
						step={step}
						value={value || ""}
					>
						<ChakraNumberInput.Control />
						<ChakraNumberInput.Input
							_disabled={{
								opacity: 0.6,
								cursor: "not-allowed",
							}}
							_placeholder={{ color: "fg.muted", opacity: 0.8 }}
							_readOnly={{
								cursor: "default",
							}}
							autoFocus={autoFocus}
							bg="bg.muted"
							color="fg"
							name={name}
							onBlur={onBlur}
							onKeyDown={(e) => {
								if (!allowDecimals && e.key === ".") {
									e.preventDefault();
								}
							}}
							placeholder={placeholder}
							readOnly={readOnly}
							ref={ref}
						/>
					</ChakraNumberInput.Root>
				)}
			</Box>

			{helpText && !errorMessage && (
				<Field.HelperText color="fg.muted" fontSize="xs">
					{helpText}
				</Field.HelperText>
			)}

			{errorMessage && (
				<Field.ErrorText color="red.500" fontSize="xs">
					{errorMessage}
				</Field.ErrorText>
			)}
		</Field.Root>
	);
};

export default NumberInput;
