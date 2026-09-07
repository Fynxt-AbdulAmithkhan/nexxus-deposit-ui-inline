import { Box, HStack, IconButton, Menu, Portal, Text } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { TransactionLimit } from "@/api/service.types";
import { Icon } from "@/components/ui";
import {
	CountriesListFormatter,
	PSPListFormatter,
} from "@/components/ui/formatters";
import { formatAmountRange, formatDate } from "./format-helpers";

interface UseTableColumnsProps {
	onEditLimit: (transactionLimit: TransactionLimit) => void;
	onDeleteLimit: (transactionLimit: TransactionLimit) => void;
}

/**
 * Hook to create table columns configuration for transaction limits
 */
export const useTableColumns = ({
	onEditLimit,
	onDeleteLimit,
}: UseTableColumnsProps) => {
	const { t } = useTranslation();
	const getActionLookupValue = (
		action: TransactionLimit["pspActions"][number],
	) => (action.flowActionName ?? action.flowActionId).toLowerCase();

	const columns: ColumnDef<TransactionLimit>[] = [
		{
			enableSorting: false,
			accessorKey: "name",
			header: t("transactionLimits.name"),
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("name")}
				</Text>
			),
		},
		{
			accessorKey: "currency",
			enableSorting: false,
			header: t("transactionLimits.currency"),
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("currency")}
				</Text>
			),
		},
		{
			accessorKey: "countries",
			enableSorting: false,
			header: t("transactionLimits.country"),
			cell: ({ row }) => (
				<CountriesListFormatter
					countries={row.getValue("countries")}
					maxVisible={3}
				/>
			),
		},
		{
			accessorKey: "psps",
			header: t("transactionLimits.psp"),
			enableSorting: false,
			size: 500,
			cell: ({ row }) => (
				<PSPListFormatter maxVisible={3} psps={row.getValue("psps")} />
			),
		},
		{
			accessorKey: "depositLimits",
			enableSorting: false,
			header: t("transactionLimits.deposit"),
			cell: ({ row }) => {
				const pspActions = row.original
					.pspActions as TransactionLimit["pspActions"];
				const depositAction = pspActions?.find((action) =>
					getActionLookupValue(action).includes("deposit"),
				);

				if (!depositAction) {
					return (
						<Text color="gray.500" fontSize="xs">
							{t("transactionLimits.noLimits")}
						</Text>
					);
				}

				return (
					<Text color="gray.700" fontSize="xs">
						{formatAmountRange(
							depositAction.minAmount,
							depositAction.maxAmount,
						)}
					</Text>
				);
			},
		},
		{
			accessorKey: "withdrawalLimits",
			enableSorting: false,
			header: t("transactionLimits.withdrawal"),
			cell: ({ row }) => {
				const pspActions = row.original
					.pspActions as TransactionLimit["pspActions"];
				const withdrawalAction = pspActions?.find(
					(action) =>
						getActionLookupValue(action).includes("withdrawal") ||
						getActionLookupValue(action).includes("withdraw"),
				);

				if (!withdrawalAction) {
					return (
						<Text color="gray.500" fontSize="xs">
							{t("transactionLimits.noLimits")}
						</Text>
					);
				}

				return (
					<Text color="gray.700" fontSize="xs">
						{formatAmountRange(
							withdrawalAction.minAmount,
							withdrawalAction.maxAmount,
						)}
					</Text>
				);
			},
		},
		{
			accessorKey: "createdAt",
			enableSorting: false,
			header: t("transactionLimits.createdOn"),
			cell: ({ row }) => (
				<Text color="gray.700" fontSize="xs">
					{formatDate(row.getValue("createdAt"))}
				</Text>
			),
		},
		{
			enableSorting: false,
			id: "actions",
			header: "",
			cell: ({ row }) => (
				<Box display="flex" justifyContent="flex-end" width="100%">
					<Menu.Root>
						<Menu.Trigger asChild>
							<IconButton
								aria-label="Open menu"
								color="fg.muted"
								size="xs"
								variant="ghost"
							>
								<Icon name="ellipsis-v" size="xs" />
							</IconButton>
						</Menu.Trigger>
						<Portal>
							<Menu.Positioner>
								<Menu.Content>
									<Menu.Item
										onClick={() => onEditLimit(row.original)}
										px={2}
										value="edit"
									>
										<HStack gap={2}>
											<Icon name="edit" size="xs" />
											<Text fontSize="xs">
												{t("transactionLimits.editLimit")}
											</Text>
										</HStack>
									</Menu.Item>
									<Menu.Item
										onClick={() => onDeleteLimit(row.original)}
										px={2}
										value="delete"
									>
										<HStack gap={2}>
											<Icon name="trash" size="xs" />
											<Text fontSize="xs">
												{t("transactionLimits.deleteLimit")}
											</Text>
										</HStack>
									</Menu.Item>
								</Menu.Content>
							</Menu.Positioner>
						</Portal>
					</Menu.Root>
				</Box>
			),
		},
	];

	return columns;
};
