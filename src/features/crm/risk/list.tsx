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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RiskRule } from "@/api/service.types";
import { RiskService } from "@/api/services";
import { PSPListFormatter } from "@/components/ui/formatters";
import { Icon } from "@/components/ui/Icon/icon";
import { Modal } from "@/components/ui/Modal/modal";
import { DataTable } from "@/components/ui/Table/table";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import RiskRuleModal from "./components/risk-rule-modal";
import { useRiskRulesQuery } from "./hooks/use-risk-rule-queries";

const RiskList: React.FC = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [riskRuleToDelete, setRiskRuleToDelete] = useState<RiskRule | null>(
		null,
	);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [riskRuleToEdit, setRiskRuleToEdit] = useState<RiskRule | null>(null);

	// Get brand and environment from hook
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();

	// Fetch risk rules using the new query hook
	const riskRulesQuery = useRiskRulesQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
	);

	// Delete risk rule mutation
	const deleteRiskRuleMutation = useMutation({
		mutationFn: RiskService.deleteRiskRule,
		onSuccess: () => {
			// Invalidate and refetch risk rules list
			queryClient.invalidateQueries({
				queryKey: ["riskRules"],
				exact: false,
			});
			invalidateCommonPSPQueries();
		},
	});

	const handleCreateRiskRule = (): void => {
		setIsCreateModalOpen(true);
	};

	const handleEditRiskRule = (riskRule: RiskRule): void => {
		setRiskRuleToEdit(riskRule);
		setIsEditModalOpen(true);
	};

	const deleteRiskRule = (riskRule: RiskRule): void => {
		setRiskRuleToDelete(riskRule);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = (): void => {
		if (riskRuleToDelete) {
			deleteRiskRuleMutation.mutate(riskRuleToDelete.id);
			setIsDeleteModalOpen(false);
			setRiskRuleToDelete(null);
		}
	};

	// Table columns definition
	const columns: ColumnDef<RiskRule, unknown>[] = [
		{
			accessorKey: "name",
			header: t("riskRules.name"),
			cell: ({ row }) => (
				<Text fontSize="xs" fontWeight="medium">
					{row.getValue("name")}{" "}
				</Text>
			),
		},
		{
			accessorKey: "type",
			header: t("riskRules.type"),
			cell: ({ row }) => {
				const type = row.getValue("type") as string;
				const getBadgeColor = (riskType: string) => {
					switch (riskType) {
						case "CUSTOMER":
							return { bg: "blue.100", color: "blue.800" };
						case "TRANSACTION":
							return { bg: "green.100", color: "green.800" };
						case "MERCHANT":
							return { bg: "purple.100", color: "purple.800" };
						default:
							return { bg: "gray.100", color: "gray.800" };
					}
				};
				const colors = getBadgeColor(type);
				return (
					<Badge
						bg={colors.bg}
						color={colors.color}
						fontSize="xs"
						fontWeight="normal"
						variant="subtle"
					>
						{t(`riskRules.types.${type}`)}
					</Badge>
				);
			},
		},
		{
			accessorKey: "action",
			header: t("riskRules.action"),
			cell: ({ row }) => {
				const action = row.getValue("action") as string;
				const getBadgeColor = (riskAction: string) => {
					switch (riskAction) {
						case "BLOCK":
							return { bg: "red.100", color: "red.800" };
						case "ALLOW":
							return { bg: "green.100", color: "green.800" };
						case "REVIEW":
							return { bg: "yellow.100", color: "yellow.800" };
						default:
							return { bg: "gray.100", color: "gray.800" };
					}
				};
				const colors = getBadgeColor(action);
				return (
					<Badge
						bg={colors.bg}
						color={colors.color}
						fontSize="xs"
						fontWeight="normal"
						variant="subtle"
					>
						{t(`riskRules.actions.${action}`)}
					</Badge>
				);
			},
		},

		{
			accessorKey: "currency",
			header: t("riskRules.currency"),
			cell: ({ row }) => (
				<Badge
					bg="gray.200"
					color="gray.900"
					fontSize="xs"
					fontWeight="normal"
					variant="subtle"
				>
					{row.getValue("currency")}
				</Badge>
			),
		},
		{
			accessorKey: "maxAmount",
			header: t("riskRules.maxAmount"),
			cell: ({ row }) => {
				const amount = row.getValue("maxAmount") as number;
				return (
					<Text fontSize="xs" fontWeight="medium">
						{amount.toLocaleString()}
					</Text>
				);
			},
		},
		{
			accessorKey: "duration",
			header: t("riskRules.duration"),
			cell: ({ row }) => (
				<Badge
					bg="blue.50"
					color="blue.500"
					fontSize="xs"
					fontWeight="normal"
					variant="subtle"
				>
					{row.getValue("duration")}
				</Badge>
			),
		},
		{
			accessorKey: "psps",
			header: t("riskRules.psp"),
			cell: ({ row }) => {
				const psps = row.getValue("psps") as RiskRule["psps"];
				return <PSPListFormatter maxVisible={2} psps={psps} />;
			},
		},

		{
			id: "actions",
			header: "",
			size: 10,

			cell: ({ row }) => (
				<Box display="flex" justifyContent="flex-end" width="100%">
					<Menu.Root>
						<Menu.Trigger asChild>
							<IconButton
								aria-label={t("common.openMenu")}
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
										onClick={() => handleEditRiskRule(row.original)}
										px={2}
										value="edit"
									>
										<HStack gap={2}>
											<Icon name="edit" size="xs" />
											<Text fontSize="xs">{t("common.edit")}</Text>
										</HStack>
									</Menu.Item>
									<Menu.Item
										onClick={() => deleteRiskRule(row.original)}
										px={2}
										value="delete"
									>
										<HStack gap={2}>
											<Icon name="trash" size="xs" />
											<Text fontSize="xs">{t("common.delete")}</Text>
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
			{/* Header */}
			{/* Main Content */}
			<Box>
				{riskRulesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Spinner color="primary.500" size="lg" />
							<Text color="gray.600">{t("riskRules.loadingRiskRules")}</Text>
						</VStack>
					</Flex>
				)}

				{riskRulesQuery.isError && !riskRulesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Text color="red.500" fontSize="lg" fontWeight="medium">
								{t("riskRules.errorLoadingRiskRules")}
							</Text>
							<Text color="gray.600" textAlign="center">
								{riskRulesQuery.error?.message ||
									t("riskRules.failedToLoadRiskRules")}
							</Text>
							<Button onClick={() => riskRulesQuery.refetch()}>
								{t("common.retry")}
							</Button>
						</VStack>
					</Flex>
				)}

				{!(riskRulesQuery.isLoading || riskRulesQuery.isError) && (
					<DataTable
						actions={
							<Button onClick={handleCreateRiskRule}>
								<Plus size={22} />
								{t("riskRules.createRiskRule")}
							</Button>
						}
						columns={columns}
						data={riskRulesQuery.data || []}
						getRowId={(row) => String(row.id)}
						globalSearchPlaceholder={t("riskRules.searchPlaceholder")}
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
								setRiskRuleToDelete(null);
							}}
							variant="outline"
						>
							{t("common.cancel")}
						</Button>
						<Button onClick={confirmDelete}>{t("common.delete")}</Button>
					</HStack>
				}
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setRiskRuleToDelete(null);
				}}
				placement="top"
				size="md"
				title={t("riskRules.deleteRiskRule")}
			>
				<Box>
					<Text mb={4}>
						{t("riskRules.modals.deleteConfirmation", {
							ruleName: riskRuleToDelete?.name || "",
						})}
					</Text>
				</Box>
			</Modal>

			{/* Create Risk Rule Modal */}
			<RiskRuleModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>

			{/* Edit Risk Rule Modal */}
			<RiskRuleModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setRiskRuleToEdit(null);
				}}
				riskRuleId={riskRuleToEdit?.id}
			/>
		</Box>
	);
};

export default RiskList;
