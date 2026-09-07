import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";

export interface I18nTooltipProps extends ChakraTooltip.RootProps {
	showArrow?: boolean;
	portalled?: boolean;
	portalRef?: React.RefObject<HTMLElement>;
	content?: React.ReactNode;
	contentProps?: ChakraTooltip.ContentProps;
	disabled?: boolean;
	// i18n specific props
	translationKey?: string;
	translationParams?: Record<string, string | number>;
	fallbackText?: string;
}

export const I18nTooltip = React.forwardRef<HTMLDivElement, I18nTooltipProps>(
	function I18nTooltipComponent(props, ref) {
		const {
			showArrow,
			children,
			disabled,
			portalled = true,
			content,
			contentProps,
			portalRef,
			translationKey,
			translationParams,
			fallbackText,
			...rest
		} = props;

		const { t } = useTranslation();

		if (disabled) {
			return children;
		}

		// Determine what content to show
		let tooltipContent: React.ReactNode;
		if (content) {
			// Use provided content if available
			tooltipContent = content;
		} else if (translationKey) {
			// Use translation if key is provided
			tooltipContent = t(translationKey, translationParams);
		} else if (fallbackText) {
			// Use fallback text if provided
			tooltipContent = fallbackText;
		} else {
			// No content to show, don't render tooltip
			return children;
		}

		return (
			<ChakraTooltip.Root {...rest} closeDelay={0} openDelay={0}>
				<ChakraTooltip.Trigger asChild cursor="pointer">
					{children}
				</ChakraTooltip.Trigger>
				<Portal container={portalRef} disabled={!portalled}>
					<ChakraTooltip.Positioner>
						<ChakraTooltip.Content ref={ref} {...contentProps}>
							{showArrow && (
								<ChakraTooltip.Arrow>
									<ChakraTooltip.ArrowTip />
								</ChakraTooltip.Arrow>
							)}
							{tooltipContent}
						</ChakraTooltip.Content>
					</ChakraTooltip.Positioner>
				</Portal>
			</ChakraTooltip.Root>
		);
	},
);
