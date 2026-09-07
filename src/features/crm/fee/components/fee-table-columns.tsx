import {
	Badge,
	Box,
	HStack,
	IconButton,
	Menu,
	Portal,
	Text,
} from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import {
	CountriesListFormatter,
	PSPListFormatter,
} from "@/components/ui/formatters";
import { Icon } from "@/components/ui/Icon/icon";
import type { Fee } from "../types";

interface FeeTableColumnsProps {
	onEdit: (fee: Fee) => void;
	onDelete: (fee: Fee) => void;
	t: TFunction;
}

export const createFeeTableColumns = ({
	onEdit,
	onDelete,
}: FeeTableColumnsProps): ColumnDef<Fee, unknown>[] => {
	return [
		{
			enableSorting: true,
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("name")}{" "}
				</Text>
			),
		},
		{
			accessorKey: "chargeFeeType",
			enableSorting: false,
			header: "Fee Type",
			cell: ({ row }) => {
				const feeType = row.getValue("chargeFeeType") as string;
				const getBadgeColor = (type: string) => {
					switch (type) {
						case "INCLUSIVE":
							return { bg: "green.100", color: "green.800" };
						case "EXCLUSIVE":
							return { bg: "orange.100", color: "orange.800" };
						default:
							return { bg: "gray.100", color: "gray.800" };
					}
				};
				const colors = getBadgeColor(feeType);
				return (
					<Badge
						bg={colors.bg}
						color={colors.color}
						fontSize="xs"
						fontWeight="normal"
						variant="subtle"
					>
						{feeType}
					</Badge>
				);
			},
		},
		{
			accessorKey: "flowActionName",
			enableSorting: false,
			header: "Flow Action",
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("flowActionName")}
				</Text>
			),
		},
		{
			accessorKey: "currency",
			enableSorting: false,
			header: "Currency",
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("currency")}
				</Text>
			),
		},
		{
			accessorKey: "countries",
			enableSorting: false,
			header: "Country",
			cell: ({ row }) => (
				<CountriesListFormatter
					countries={row.getValue("countries")}
					maxVisible={3}
				/>
			),
		},
		{
			accessorKey: "psps",
			header: "PSP",
			enableSorting: false,
			cell: ({ row }) => {
				const psps = row.getValue("psps") as Array<{
					id: string;
					name: string;
				}>;
				if (!psps || psps.length === 0) {
					return (
						<Text color="gray.500" fontSize="xs">
							No PSPs
						</Text>
					);
				}
				return <PSPListFormatter maxVisible={3} psps={psps} />;
			},
		},
		{
			enableSorting: false,
			accessorKey: "components",
			header: "Components",
			cell: ({ row }) => {
				const components = row.getValue("components") as Fee["components"];
				const types = components.map((comp) => comp.type);
				const visibleTypes = types.slice(0, 2);
				const remainingCount = types.length - 2;

				return (
					<HStack gap={1} wrap="wrap">
						{visibleTypes.map((type) => (
							<Badge
								bg="blue.50"
								color="blue.500"
								fontSize="xs"
								fontWeight="normal"
								key={type}
								variant="subtle"
							>
								{type}
							</Badge>
						))}
						{remainingCount > 0 && (
							<Badge
								bg="blue.50"
								color="blue.500"
								fontSize="xs"
								fontWeight="normal"
								variant="subtle"
							>
								+{remainingCount}
							</Badge>
						)}
					</HStack>
				);
			},
		},
		{
			enableSorting: false,
			id: "actions",
			header: "",
			size: 60,
			minSize: 60,
			maxSize: 60,
			enablePinning: true,

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
										onClick={() => onEdit(row.original)}
										px={2}
										value="edit"
									>
										<HStack gap={2}>
											<Icon name="edit" size="xs" />
											<Text fontSize="xs">Edit</Text>
										</HStack>
									</Menu.Item>
									<Menu.Item
										onClick={() => onDelete(row.original)}
										px={2}
										value="delete"
									>
										<HStack gap={2}>
											<Icon name="trash" size="xs" />
											<Text fontSize="xs">Delete</Text>
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
};
