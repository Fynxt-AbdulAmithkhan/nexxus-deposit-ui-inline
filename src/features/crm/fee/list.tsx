import {
	Box,
	Button,
	Flex,
	HStack,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FeeService } from "@/api/services";
import { Modal } from "@/components/ui/Modal/modal";
import { DataTable, TABLE_HEIGHTS } from "@/components/ui/Table/table";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import FeeModal from "./components/fee-modal";
import { createFeeTableColumns } from "./components/fee-table-columns";
import { feeQueryKeys } from "./helpers/query-keys";
import type { Fee } from "./types";

const FeeList: React.FC = () => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [feeToDelete, setFeeToDelete] = useState<Fee | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [feeToEdit, setFeeToEdit] = useState<Fee | null>(null);

	// Get brand and environment from hook
	const { selectedBrand, selectedEnvironment, isReady } = useBrandEnvironment();

	// Fetch fees using TanStack Query
	const feesQuery = useQuery({
		queryKey: feeQueryKeys.list(
			selectedBrand?.id || "",
			selectedEnvironment?.id || "",
		),
		queryFn: () => {
			if (!(selectedBrand?.id && selectedEnvironment?.id)) {
				throw new Error("Brand or environment not selected");
			}
			return FeeService.getFees();
		},
		select: (data) => {
			if (!data?.data) {
				return [];
			}
			return data.data;
		},
		enabled: isReady,
	});

	// Delete fee mutation
	const deleteFeeMutation = useMutation({
		mutationFn: FeeService.deleteFee,
		onSuccess: () => {
			// Invalidate and refetch fees
			queryClient.invalidateQueries({
				queryKey: feeQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				),
			});
			invalidateCommonPSPQueries();
		},
	});

	const handleCreateFee = useCallback((): void => {
		setIsCreateModalOpen(true);
	}, []);

	const handleEditFee = useCallback((fee: Fee): void => {
		setFeeToEdit(fee);
		setIsEditModalOpen(true);
	}, []);

	const deleteFee = useCallback((fee: Fee): void => {
		setFeeToDelete(fee);
		setIsDeleteModalOpen(true);
	}, []);

	const confirmDelete = (): void => {
		if (feeToDelete) {
			deleteFeeMutation.mutate(feeToDelete.id);
			setIsDeleteModalOpen(false);
			setFeeToDelete(null);
		}
	};

	// Table columns definition
	const columns = useMemo(
		() =>
			createFeeTableColumns({
				onEdit: handleEditFee,
				onDelete: deleteFee,
				t,
			}),
		[handleEditFee, deleteFee, t],
	);

	return (
		<Box>
			{/* Header */}
			{/* Main Content */}
			<Box>
				{feesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Spinner color="primary.500" size="lg" />
							<Text color="gray.600">Loading fees...</Text>
						</VStack>
					</Flex>
				)}

				{feesQuery.isError && !feesQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Text color="red.500" fontSize="lg" fontWeight="medium">
								Error loading fees
							</Text>
							<Text color="gray.600" textAlign="center">
								{feesQuery.error?.message || "Failed to fetch fees"}
							</Text>
							<Button onClick={() => feesQuery.refetch()}>Retry</Button>
						</VStack>
					</Flex>
				)}

				{!(feesQuery.isLoading || feesQuery.isError) && (
					<DataTable
						actions={
							<Button onClick={handleCreateFee}>
								<Plus size={22} />
								Add Fee
							</Button>
						}
						columns={columns}
						data={feesQuery.data || []}
						globalSearchPlaceholder="Search fees by name, currency, or PSP..." // Enable sticky header
						maxHeight={TABLE_HEIGHTS.STANDARD} // Control scroll height
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
								setFeeToDelete(null);
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
					setFeeToDelete(null);
				}}
				placement="top"
				size="md"
				title="Delete Fee Configuration"
			>
				<Box>
					<Text mb={4}>
						Are you sure you want to delete the fee configuration{" "}
						<strong>{feeToDelete?.name}</strong>? This action cannot be undone.
					</Text>
				</Box>
			</Modal>

			{/* Create Fee Modal */}
			<FeeModal
				isOpen={isCreateModalOpen}
				mode="create"
				onClose={() => setIsCreateModalOpen(false)}
			/>

			{/* Edit Fee Modal */}
			<FeeModal
				feeId={feeToEdit?.id}
				isOpen={isEditModalOpen}
				mode="edit"
				onClose={() => {
					setIsEditModalOpen(false);
					setFeeToEdit(null);
				}}
			/>
		</Box>
	);
};

export default FeeList;
