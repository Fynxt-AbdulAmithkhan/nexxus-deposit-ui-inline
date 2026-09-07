import { Dialog, IconButton } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Icon } from "../Icon/icon";

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: ReactNode;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "full" | "cover";
	scrollBehavior?: "inside" | "outside";
	placement?: "center" | "top" | "bottom";
	closeOnOverlayClick?: boolean;
	closeOnEsc?: boolean;
	showCloseButton?: boolean;
	trigger?: ReactNode;
	footer?: ReactNode;
	/** Max height for body content when scrollable (e.g. "60vh") */
	bodyMaxHeight?: string;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	size = "md",
	scrollBehavior = "inside",
	placement = "top",
	closeOnOverlayClick = false,
	closeOnEsc = true,
	showCloseButton = true,
	trigger,
	footer,
	bodyMaxHeight,
}: ModalProps) {
	return (
		<Dialog.Root
			closeOnEscape={closeOnEsc}
			closeOnInteractOutside={closeOnOverlayClick}
			onOpenChange={(details) => {
				if (!details.open) {
					onClose();
				}
			}}
			open={isOpen}
			placement={placement}
			scrollBehavior={scrollBehavior}
			size={size}
		>
			{trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
			<Dialog.Backdrop />
			<Dialog.Positioner>
				<Dialog.Content bg="bg.muted">
					<Dialog.Header>
						<Dialog.Title>{title}</Dialog.Title>
					</Dialog.Header>
					{showCloseButton && (
						<Dialog.CloseTrigger asChild>
							<IconButton color="fg.muted" onClick={onClose} variant="ghost">
								<Icon name="x" size="sm" />
							</IconButton>
						</Dialog.CloseTrigger>
					)}
					<Dialog.Body
						overflowY={bodyMaxHeight ? "auto" : undefined}
						maxH={bodyMaxHeight}
					>
						{children}
					</Dialog.Body>
					<Dialog.Footer>{footer}</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Positioner>
		</Dialog.Root>
	);
}
