import { Box, Field, IconButton, InputGroup } from "@chakra-ui/react";
import {
	Input as ChakraInput,
	type InputProps as ChakraInputProps,
} from "@chakra-ui/react/input";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui";
import type { IconProps } from "@/components/ui/Icon/icon.type";
import { I18nTooltip } from "@/components/ui/Tooltip/i18n-tooltip";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";

export type InputProps = {
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
	type?: string;
	leftIcon?: {
		name: string;
		prefix?: IconProps["prefix"];
	};
	rightIcon?: {
		name: string;
		prefix?: IconProps["prefix"];
		onClick?: () => void;
	};
	errorMessage?: string;
	borderColor?: string;
	required?: boolean;
	readOnly?: boolean;
	autoFocus?: boolean;
	maxLength?: number;
	minLength?: number;
	pattern?: string;
	title?: string;
	helpText?: string;
	shouldFloat?: boolean;
	tooltip?: string;
	i18nTooltip?: {
		translationKey: string;
		fallbackText?: string;
		translationParams?: Record<string, string | number>;
	};
	[key: string]: ChakraInputProps[keyof ChakraInputProps];
};

const Input = ({
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
	type = "text",
	leftIcon,
	rightIcon,
	errorMessage,
	required = false,
	readOnly = false,
	autoFocus = false,
	maxLength,
	minLength,
	pattern,
	title,
	helpText,
	shouldFloat = true,
	tooltip,
	i18nTooltip,
	...restProps
}: InputProps): ReactElement => {
	const { t } = useTranslation();

	const renderIcon = (iconConfig: {
		name: string;
		prefix?: IconProps["prefix"];
	}) => <Icon name={iconConfig.name} prefix={iconConfig.prefix} />;

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

				<InputGroup
					endElement={
						rightIcon ? (
							rightIcon.onClick ? (
								<IconButton
									aria-label={t("common.toggleVisibility")}
									onClick={rightIcon.onClick}
									size="sm"
									variant="ghost"
								>
									<Icon
										color="#404040"
										name={rightIcon.name}
										prefix={rightIcon.prefix}
										size="xs"
									/>
								</IconButton>
							) : (
								renderIcon(rightIcon)
							)
						) : undefined
					}
					startElement={leftIcon ? renderIcon(leftIcon) : undefined}
				>
					<ChakraInput
						{...restProps}
						_disabled={{
							opacity: 0.6,
							cursor: "not-allowed",
						}}
						_placeholder={{
							color: "fg.muted",
							opacity: 0.8,
							...(type === "password" && {
								fontFamily: "body",
								letterSpacing: "normal",
							}),
						}}
						_readOnly={{
							cursor: "default",
						}}
						autoFocus={autoFocus}
						bg="bg.muted"
						borderColor="border"
						color="fg"
						disabled={isDisabled}
						maxLength={maxLength}
						minLength={minLength}
						name={name}
						onBlur={(e) => {
							const trimmedValue = e.target.value.trim();
							if (trimmedValue !== e.target.value) {
								onChange?.(trimmedValue);
							}
							onBlur?.(e);
						}}
						onChange={(e) => onChange?.(e.target.value)}
						pattern={pattern}
						placeholder={placeholder}
						readOnly={readOnly}
						ref={ref}
						size={size}
						{...(type === "password" && {
							fontFamily: "monospace",
						})}
						title={title}
						type={type}
						value={value || ""}
					/>
				</InputGroup>
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

export default Input;
