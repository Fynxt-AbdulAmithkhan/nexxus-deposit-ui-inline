import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { TransactionLimit } from "@/api/service.types";
import { TransactionLimitsService } from "@/api/services/transaction-limits.service";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { transactionLimitQueryKeys } from "../helpers/query-keys";
import { useTransactionLimitsQuery } from "./use-transaction-limit-queries";

/**
 * Custom hook for managing transaction limit list state and operations
 */
export const useTransactionLimitList = () => {
	const queryClient = useQueryClient();
	const { selectedBrand, selectedEnvironment, isReady } = useBrandEnvironment();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();
	// Modal state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [transactionLimitToEdit, setTransactionLimitToEdit] =
		useState<TransactionLimit | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [transactionLimitToDelete, setTransactionLimitToDelete] =
		useState<TransactionLimit | null>(null);

	// Fetch transaction limits using TanStack Query
	const transactionLimitsQuery = useTransactionLimitsQuery(
		selectedBrand?.id,
		selectedEnvironment?.id,
		isReady,
	);

	// Delete transaction limit mutation
	const deleteTransactionLimitMutation = useMutation({
		mutationFn: (transactionLimitId: number) => {
			return TransactionLimitsService.deleteTransactionLimit(
				transactionLimitId,
			);
		},
		onSuccess: () => {
			// Invalidate and refetch transaction limits
			queryClient.invalidateQueries({
				queryKey: transactionLimitQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				),
			});
			invalidateCommonPSPQueries();
		},
	});

	// Event handlers
	const handleCreateLimit = (): void => {
		setIsCreateModalOpen(true);
	};

	const handleEditLimit = (transactionLimit: TransactionLimit): void => {
		setTransactionLimitToEdit(transactionLimit);
		setIsEditModalOpen(true);
	};

	const handleDeleteLimit = (transactionLimit: TransactionLimit): void => {
		setTransactionLimitToDelete(transactionLimit);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = (): void => {
		if (transactionLimitToDelete) {
			deleteTransactionLimitMutation.mutate(transactionLimitToDelete.id);
			setIsDeleteModalOpen(false);
			setTransactionLimitToDelete(null);
		}
	};

	const closeCreateModal = (): void => {
		setIsCreateModalOpen(false);
	};

	const closeEditModal = (): void => {
		setIsEditModalOpen(false);
		setTransactionLimitToEdit(null);
	};

	const closeDeleteModal = (): void => {
		setIsDeleteModalOpen(false);
		setTransactionLimitToDelete(null);
	};

	return {
		// Query state
		transactionLimitsQuery,
		deleteTransactionLimitMutation,

		// Modal state
		isCreateModalOpen,
		isEditModalOpen,
		isDeleteModalOpen,
		transactionLimitToEdit,
		transactionLimitToDelete,

		// Event handlers
		handleCreateLimit,
		handleEditLimit,
		handleDeleteLimit,
		confirmDelete,
		closeCreateModal,
		closeEditModal,
		closeDeleteModal,
	};
};
