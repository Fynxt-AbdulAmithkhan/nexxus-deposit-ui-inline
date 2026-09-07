import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import React from "react";

export interface TooltipProps extends ChakraTooltip.RootProps {
	showArrow?: boolean;
	portalled?: boolean;
	portalRef?: React.RefObject<HTMLElement>;
	content: React.ReactNode;
	contentProps?: ChakraTooltip.ContentProps;
	disabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
	function TooltipComponent(props, ref) {
		const {
			showArrow,
			children,
			disabled,
			portalled = true,
			content,
			contentProps,
			portalRef,
			...rest
		} = props;

		if (disabled) {
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
							{content}
						</ChakraTooltip.Content>
					</ChakraTooltip.Positioner>
				</Portal>
			</ChakraTooltip.Root>
		);
	},
);
