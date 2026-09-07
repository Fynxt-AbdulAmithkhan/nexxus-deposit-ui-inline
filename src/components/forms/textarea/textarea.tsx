/** biome-ignore-all lint/suspicious/noExplicitAny: <any> */
import { Box, Textarea as ChakraTextarea, Field } from "@chakra-ui/react";
import type { ReactElement } from "react";
import { Icon } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";
import { floatingLabelStyles } from "@/styles/floating-label";

export type TextareaProps = {
	label?: string;
	size?: "sm" | "md" | "lg" | "xs";
	isDisabled?: boolean;
	isInvalid?: boolean;
	value?: string;
	onChange?: (value: string) => void;
	onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
	name?: string;
	ref?: React.Ref<HTMLTextAreaElement>;
	placeholder?: string;
	errorMessage?: string;
	required?: boolean;
	readOnly?: boolean;
	autoFocus?: boolean;
	maxLength?: number;
	minLength?: number;
	helpText?: string;
	shouldFloat?: boolean;
	tooltip?: string;
	rows?: number;
	resize?: "none" | "both" | "horizontal" | "vertical";
	[key: string]: any;
};

const Textarea = ({
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
	errorMessage,
	required = false,
	readOnly = false,
	autoFocus = false,
	maxLength,
	minLength,
	helpText,
	shouldFloat = true,
	tooltip,
	rows = 4,
	resize = "vertical",
	...restProps
}: TextareaProps): ReactElement => {
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
						{tooltip && (
							<Tooltip content={tooltip}>
								<Icon
									color="fg.muted"
									name="circle-info"
									prefix="far"
									size="sm"
								/>
							</Tooltip>
						)}
					</Field.Label>
				)}

				<ChakraTextarea
					{...restProps}
					_disabled={{
						opacity: 0.6,
						cursor: "not-allowed",
					}}
					_placeholder={{
						color: "fg.muted",
						opacity: 0.8,
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
					onBlur={onBlur}
					onChange={(e) => onChange?.(e.target.value)}
					placeholder={placeholder}
					readOnly={readOnly}
					ref={ref}
					resize={resize}
					rows={rows}
					size={size}
					value={value || ""}
				/>
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

export default Textarea;
