import { Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TransactionLimitsService } from "@/api/services/transaction-limits.service";
import { Modal } from "@/components/ui/Modal/modal";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { transactionLimitQueryKeys } from "../helpers/query-keys";
import { useTransactionLimitQuery } from "../hooks/use-transaction-limit-queries";
import type { PSPResponse, TransactionLimitFormData } from "../types";
import TransactionLimitForm from "./transaction-limit-form";

interface TransactionLimitModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "create" | "edit";
	limitId?: number; // Integer from database
}

const TransactionLimitModal: React.FC<TransactionLimitModalProps> = ({
	isOpen,
	onClose,
	mode,
	limitId,
}) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();

	// Fetch transaction limit data for edit mode
	const { data: limitData, isLoading: isLoadingLimit } =
		useTransactionLimitQuery(mode === "edit" && limitId ? limitId : undefined);

	// Create transaction limit mutation
	const createLimitMutation = useMutation({
		mutationFn: (formData: TransactionLimitFormData) =>
			TransactionLimitsService.createTransactionLimit(formData),
		onSuccess: async (data) => {
			if (data.data) {
				const queryKey = transactionLimitQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				);
				await queryClient.refetchQueries({ queryKey });
				invalidateCommonPSPQueries();
				onClose();
			}
		},
	});

	// Update transaction limit mutation
	const updateLimitMutation = useMutation({
		mutationFn: ({
			id,
			data: formData,
		}: {
			id: number;
			data: TransactionLimitFormData;
		}) => TransactionLimitsService.updateTransactionLimit(id, formData),
		onSuccess: async (_, variables) => {
			await Promise.all([
				queryClient.refetchQueries({
					queryKey: transactionLimitQueryKeys.list(
						selectedBrand?.id || "",
						selectedEnvironment?.id || "",
					),
				}),
				queryClient.refetchQueries({
					queryKey: transactionLimitQueryKeys.detail(String(variables.id)),
				}),
			]);
			invalidateCommonPSPQueries();
			onClose();
		},
	});

	const handleSubmit = (data: TransactionLimitFormData) => {
		if (mode === "create") {
			createLimitMutation.mutate(data);
		} else if (mode === "edit" && limitId) {
			updateLimitMutation.mutate({ id: limitId, data });
		}
	};

	// Prepare initial data for edit mode
	const initialData = useMemo(():
		| Partial<TransactionLimitFormData>
		| undefined => {
		if (mode === "edit" && limitData) {
			return {
				name: limitData.name,
				currency: limitData.currency,
				countries: limitData.countries,
				psps: limitData.psps.map((psp: PSPResponse) => ({ id: psp.id })),
				customerTags: limitData.customerTags,
				pspActions: limitData.pspActions,
				status: limitData.status,
			};
		}
	}, [mode, limitData]);

	const modalConfig = {
		create: {
			title: t("transactionLimits.modals.addTransactionLimit"),
			submitText: t("transactionLimits.modals.addRule"),
			formId: "create-transaction-limit-form",
			size: "xl" as const,
		},
		edit: {
			title: t("transactionLimits.modals.editTransactionLimit"),
			submitText: t("transactionLimits.modals.updateRule"),
			formId: "edit-transaction-limit-form",
			size: "xl" as const,
		},
	};

	const config = modalConfig[mode];
	const isLoading = mode === "edit" && isLoadingLimit;
	const isMutationLoading =
		createLimitMutation.isPending || updateLimitMutation.isPending;

	return (
		<Modal
			footer={
				<HStack gap={3} justify="flex-end">
					<Button
						disabled={isMutationLoading}
						onClick={onClose}
						variant="outline"
					>
						{t("common.cancel")}
					</Button>
					<Button
						form={config.formId}
						loading={isMutationLoading}
						type="submit"
					>
						{config.submitText}
					</Button>
				</HStack>
			}
			isOpen={isOpen}
			onClose={onClose}
			size={config.size}
			title={config.title}
		>
			{isLoading ? (
				<VStack gap={4} py={8}>
					<Spinner color="primary.500" size="lg" />
					<Text color="gray.600">
						{t("transactionLimits.modals.loadingLimit")}
					</Text>
				</VStack>
			) : (
				<TransactionLimitForm
					formId={config.formId}
					initialData={initialData}
					key={limitId || "create"}
					mode={mode}
					onSubmit={handleSubmit}
				/>
			)}
		</Modal>
	);
};

export default TransactionLimitModal;
