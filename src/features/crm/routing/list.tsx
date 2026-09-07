import {
	Badge,
	Box,
	Button,
	Flex,
	HStack,
	IconButton,
	Menu,
	Portal,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { RoutingRulesService } from "@/api/services";
import { Tooltip } from "@/components/ui";
import { Icon } from "@/components/ui/Icon/icon";
import { Modal } from "@/components/ui/Modal/modal";
import { DataTable, TABLE_HEIGHTS } from "@/components/ui/Table/table";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import RoutingRuleModal from "./components/routing-rule-modal";
import { routingRuleQueryKeys } from "./helpers/query-keys";
import type { RoutingRule } from "./types";

const RoutingRuleList: React.FC = () => {
	const queryClient = useQueryClient();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [routingRuleToEdit, setRoutingRuleToEdit] =
		useState<RoutingRule | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [routingRuleToDelete, setRoutingRuleToDelete] =
		useState<RoutingRule | null>(null);

	// Get brand and environment from hook
	const { selectedBrand, selectedEnvironment, isReady } = useBrandEnvironment();

	// Fetch routing rules using TanStack Query
	const routingRulesQuery = useQuery({
		queryKey: routingRuleQueryKeys.list(
			selectedBrand?.id || "",
			selectedEnvironment?.id || "",
		),
		queryFn: () => {
			const brandId = selectedBrand?.id;
			const environmentId = selectedEnvironment?.id;
			if (!brandId) {
				throw new Error("Brand not selected");
			}
			if (!environmentId) {
				throw new Error("Environment not selected");
			}
			return RoutingRulesService.getRoutingRules();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: isReady,
	});

	// Delete routing rule mutation
	const deleteRoutingRuleMutation = useMutation({
		mutationFn: (ruleId: number) => {
			return RoutingRulesService.deleteRoutingRule(ruleId);
		},
		onSuccess: () => {
			// Invalidate and refetch routing rules
			queryClient.invalidateQueries({
				queryKey: routingRuleQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				),
			});
		},
	});

	const handleCreateRule = (): void => {
		setIsCreateModalOpen(true);
	};

	const handleEditRule = (routingRule: RoutingRule): void => {
		setRoutingRuleToEdit(routingRule);
		setIsEditModalOpen(true);
	};

	const handleDeleteRule = (routingRule: RoutingRule): void => {
		setRoutingRuleToDelete(routingRule);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = (): void => {
		if (routingRuleToDelete) {
			deleteRoutingRuleMutation.mutate(Number(routingRuleToDelete.id));
			setIsDeleteModalOpen(false);
			setRoutingRuleToDelete(null);
		}
	};

	// Format PSPs display - show all PSPs
	const formatPSPs = (psps: RoutingRule["psps"]) => {
		return (
			<HStack gap={1} wrap="wrap">
				{psps.map((psp) => (
					<Tooltip content={psp.pspName} key={psp.pspId}>
						<Badge
							bg="secondary.subtle"
							color="secondary.solid"
							fontSize="xs"
							fontWeight="normal"
							maxWidth="120px"
						>
							<Text
								minW={0}
								overflow="hidden"
								textOverflow="ellipsis"
								w="full"
								whiteSpace="nowrap"
							>
								{psp.pspName}
							</Text>
						</Badge>
					</Tooltip>
				))}
			</HStack>
		);
	};

	// Format date display
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			})
			.replace(",", " |");
	};

	// Table columns definition
	const columns: ColumnDef<RoutingRule>[] = [
		{
			enableSorting: false,
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("name")}
				</Text>
			),
		},
		{
			accessorKey: "pspSelectionMode",
			enableSorting: false,
			header: "Routing Method",
			cell: ({ row }) => {
				const method = row.getValue("pspSelectionMode") as string;
				const getBadgeColor = (methodType: string) => {
					switch (methodType) {
						case "WEIGHTAGE":
							return { bg: "blue.100", color: "blue.800" };
						case "PRIORITY":
							return { bg: "green.100", color: "green.800" };
						default:
							return { bg: "gray.100", color: "gray.800" };
					}
				};
				const colors = getBadgeColor(method);
				return (
					<Badge
						bg={colors.bg}
						color={colors.color}
						fontSize="xs"
						fontWeight="normal"
						variant="subtle"
					>
						{method}
					</Badge>
				);
			},
		},
		{
			accessorKey: "psps",
			header: "PSPs",
			enableSorting: false,
			cell: ({ row }) => formatPSPs(row.getValue("psps")),
		},
		{
			accessorKey: "createdAt",
			enableSorting: false,
			header: "Created On",
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
										onClick={() => handleEditRule(row.original)}
										px={2}
										value="edit"
									>
										<HStack gap={2}>
											<Icon name="edit" size="xs" />
											<Text fontSize="xs">Edit</Text>
										</HStack>
									</Menu.Item>
									<Menu.Item
										onClick={() => handleDeleteRule(row.original)}
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

	return (
		<Box>
			{/* Main Content */}
			<Box>
				{routingRulesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Spinner color="primary.500" size="lg" />
							<Text color="gray.600">Loading routing rules...</Text>
						</VStack>
					</Flex>
				)}

				{routingRulesQuery.isError && !routingRulesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Text color="red.500" fontSize="lg" fontWeight="medium">
								Error loading routing rules
							</Text>
							<Text color="gray.600" textAlign="center">
								{routingRulesQuery.error?.message ||
									"Failed to fetch routing rules"}
							</Text>
							<Button onClick={() => routingRulesQuery.refetch()}>Retry</Button>
						</VStack>
					</Flex>
				)}

				{!(routingRulesQuery.isLoading || routingRulesQuery.isError) && (
					<DataTable
						actions={
							<Button onClick={handleCreateRule}>
								<Plus size={22} />
								Add Routing Rule
							</Button>
						}
						columns={columns}
						data={routingRulesQuery.data || []}
						globalSearchPlaceholder="Search routing rules by name, routing method, or PSP..."
						maxHeight={TABLE_HEIGHTS.STANDARD}
						showGlobalSearch={true}
						showPagination={false}
						size="sm"
						stickyHeader={true}
					/>
				)}
			</Box>

			{/* Delete Confirmation Modal */}
			<Modal
				footer={
					<HStack gap={3} justify="flex-end">
						<Button
							onClick={() => {
								setIsDeleteModalOpen(false);
								setRoutingRuleToDelete(null);
							}}
							variant="outline"
						>
							Cancel
						</Button>
						<Button onClick={confirmDelete}>Delete</Button>
					</HStack>
				}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setRoutingRuleToDelete(null);
				}}
				placement="top"
				size="md"
				title="Delete Routing Rule"
			>
				<Box>
					<Text mb={4}>
						Are you sure you want to delete the routing rule{" "}
						<strong>{routingRuleToDelete?.name}</strong>? This action cannot be
						undone.
					</Text>
				</Box>
			</Modal>

			{/* Edit Routing Rule Modal */}
			<RoutingRuleModal
				isOpen={isEditModalOpen}
				mode="edit"
				onClose={() => {
					setIsEditModalOpen(false);
					setRoutingRuleToEdit(null);
				}}
				ruleId={
					routingRuleToEdit?.id ? Number(routingRuleToEdit.id) : undefined
				}
			/>

			{/* Create Routing Rule Modal */}
			<RoutingRuleModal
				isOpen={isCreateModalOpen}
				mode="create"
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</Box>
	);
};

export default RoutingRuleList;
