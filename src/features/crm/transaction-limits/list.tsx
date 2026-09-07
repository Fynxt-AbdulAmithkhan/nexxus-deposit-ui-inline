import {
	Box,
	Button,
	Flex,
	HStack,
	Spinner,
	Text,
	VStack,
} from "@chakra-ui/react";
import { Plus } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal/modal";
import { DataTable, TABLE_HEIGHTS } from "@/components/ui/Table/table";
import TransactionLimitModal from "./components/transaction-limit-modal";
import { useTableColumns } from "./helpers/table-columns";
import { useTransactionLimitList } from "./hooks/use-transaction-limit-list";

const TransactionLimitList: React.FC = () => {
	const { t } = useTranslation();

	// Use the custom hook for all list logic
	const {
		transactionLimitsQuery,
		isCreateModalOpen,
		isEditModalOpen,
		isDeleteModalOpen,
		transactionLimitToEdit,
		transactionLimitToDelete,
		handleCreateLimit,
		handleEditLimit,
		handleDeleteLimit,
		confirmDelete,
		closeCreateModal,
		closeEditModal,
		closeDeleteModal,
	} = useTransactionLimitList();

	// Get table columns configuration
	const columns = useTableColumns({
		onEditLimit: handleEditLimit,
		onDeleteLimit: handleDeleteLimit,
	});

	return (
		<Box>
			{/* Main Content */}
			<Box>
				{transactionLimitsQuery.isLoading && (
					<Flex align="center" justify="center" minH="400px">
						<VStack gap={4}>
							<Spinner color="primary.500" size="lg" />
							<Text color="gray.600">
								{t("transactionLimits.loadingLimits")}
							</Text>
						</VStack>
					</Flex>
				)}

				{transactionLimitsQuery.isError &&
					!transactionLimitsQuery.isLoading && (
						<Flex align="center" justify="center" minH="400px">
							<VStack gap={4}>
								<Text color="red.500" fontSize="lg" fontWeight="medium">
									{t("transactionLimits.errorLoadingLimits")}
								</Text>
								<Text color="gray.600" textAlign="center">
									{transactionLimitsQuery.error?.message ||
										t("transactionLimits.failedToLoadLimits")}
								</Text>
								<Button onClick={() => transactionLimitsQuery.refetch()}>
									{t("common.retry")}
								</Button>
							</VStack>
						</Flex>
					)}

				{!(
					transactionLimitsQuery.isLoading || transactionLimitsQuery.isError
				) && (
					<DataTable
						actions={
							<Button onClick={handleCreateLimit}>
								<Plus size={22} />
								{t("transactionLimits.addLimits")}
							</Button>
						}
						columns={columns}
						data={transactionLimitsQuery.data || []}
						globalSearchPlaceholder={t("transactionLimits.searchPlaceholder")}
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
						<Button onClick={closeDeleteModal} variant="outline">
							{t("common.cancel")}
						</Button>
						<Button onClick={confirmDelete}>{t("common.delete")}</Button>
					</HStack>
				}
				isOpen={isDeleteModalOpen}
				onClose={closeDeleteModal}
				placement="top"
				size="md"
				title={t("transactionLimits.modals.deleteTransactionLimit")}
			>
				<Box>
					<Text mb={4}>
						{t("transactionLimits.modals.deleteConfirmation", {
							limitName: transactionLimitToDelete?.name,
						})}
					</Text>
				</Box>
			</Modal>

			{/* Edit Transaction Limit Modal */}
			<TransactionLimitModal
				isOpen={isEditModalOpen}
				limitId={transactionLimitToEdit?.id}
				mode="edit"
				onClose={closeEditModal}
			/>

			{/* Create Transaction Limit Modal */}
			<TransactionLimitModal
				isOpen={isCreateModalOpen}
				mode="create"
				onClose={closeCreateModal}
			/>
		</Box>
	);
};

export default TransactionLimitList;
