import { Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FeeService } from "@/api/services";
import { Modal } from "@/components/ui/Modal/modal";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { feeQueryKeys } from "../helpers/query-keys";
import type { FeeFormData } from "../types";
import FeeForm from "./fee-form";

interface FeeModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "create" | "edit";
	feeId?: number; // Integer from database
}

export const FeeModal = ({ isOpen, onClose, mode, feeId }: FeeModalProps) => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();
	// Fetch fee data for edit mode
	const feeQuery = useQuery({
		queryKey: feeQueryKeys.detail(feeId ? String(feeId) : ""),
		queryFn: () => {
			if (!feeId) {
				throw new Error("Fee ID is required");
			}
			return FeeService.getFeeById(feeId);
		},
		select: (data) => {
			if (!data?.data) {
				throw new Error("Fee not found");
			}
			return data.data;
		},
		enabled: !!(feeId && mode === "edit" && isOpen),
		staleTime: 0,
		gcTime: 0,
	});

	// Create fee mutation
	const createFeeMutation = useMutation({
		mutationFn: (formData: FeeFormData) => {
			if (!(selectedBrand?.id && selectedEnvironment?.id)) {
				throw new Error("Brand and environment must be selected");
			}

			// brandId and environmentId are automatically added via headers
			return FeeService.createFee({
				...formData,
				psps: formData.psps.map((pspId) =>
					typeof pspId === "string" ? { id: pspId } : pspId,
				),
			});
		},
		onSuccess: async (data) => {
			if (data?.data) {
				const queryKey = feeQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				);
				await queryClient.refetchQueries({ queryKey });
				invalidateCommonPSPQueries();
				onClose();
			}
		},
	});

	// Update fee mutation
	const updateFeeMutation = useMutation({
		mutationFn: ({ id, data: formData }: { id: number; data: FeeFormData }) => {
			if (!(selectedBrand?.id && selectedEnvironment?.id)) {
				throw new Error("Brand and environment must be selected");
			}

			// brandId and environmentId are automatically added via headers
			return FeeService.updateFee(id, {
				...formData,
				psps: formData.psps.map((pspId) =>
					typeof pspId === "string" ? { id: pspId } : pspId,
				),
			});
		},
		onSuccess: async (data) => {
			if (data?.data) {
				const queryKey = feeQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				);
				await queryClient.refetchQueries({ queryKey });
				invalidateCommonPSPQueries();
				onClose();
			}
		},
	});

	const handleSubmit = (data: FeeFormData) => {
		if (mode === "create") {
			createFeeMutation.mutate(data);
		} else if (mode === "edit" && feeId) {
			updateFeeMutation.mutate({ id: feeId, data });
		}
	};

	// Prepare initial data for edit mode
	const initialData = useMemo((): Partial<FeeFormData> | undefined => {
		if (mode === "edit" && feeQuery.data) {
			const fee = feeQuery.data;
			return {
				name: fee.name,
				flowActionId: fee.flowActionId,
				currency: fee.currency || "",
				chargeFeeType: fee.chargeFeeType,
				status: fee.status,
				components: fee.components.map((comp) => ({
					type: comp.type,
					amount: comp.amount,
					minValue: comp.minValue || 0,
					maxValue: comp.maxValue || 0,
				})),
				countries: fee.countries,
				psps: fee.psps.map((psp) => psp.id),
			};
		}
		return;
	}, [mode, feeQuery.data]);

	const modalConfig = {
		create: {
			title: t("fees.modals.addFee", "Add Fees Structure"),
			submitText: t("fees.addFee", "Add Rule"),
			formId: "create-fee-form",
			size: "xl" as const,
		},
		edit: {
			title: t("fees.modals.editFee", "Edit Fees Structure"),
			submitText: t("fees.updateFee", "Update Rule"),
			formId: "edit-fee-form",
			size: "xl" as const,
		},
	};

	const config = modalConfig[mode];
	const isLoading = mode === "edit" && feeQuery.isLoading;
	const isMutationLoading =
		createFeeMutation.isPending || updateFeeMutation.isPending;

	return (
		<Modal
			footer={
				<HStack gap={3} justify="flex-end">
					<Button
						disabled={isMutationLoading}
						onClick={onClose}
						variant="outline"
					>
						{t("common.cancel", "Cancel")}
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
			placement="top"
			size={config.size}
			title={config.title}
		>
			{isLoading ? (
				<VStack gap={4} py={8}>
					<Spinner color="primary.500" size="lg" />
					<Text color="gray.600">
						{t("fees.modals.loadingFee", "Loading fee...")}
					</Text>
				</VStack>
			) : (
				<FeeForm
					formId={config.formId}
					initialData={initialData}
					key={feeId || "create"}
					mode={mode}
					onSubmit={handleSubmit}
				/>
			)}
		</Modal>
	);
};

export const CreateFeeModal = (
	props: Omit<React.ComponentProps<typeof FeeModal>, "mode" | "feeId">,
) => <FeeModal {...props} mode="create" />;

export const EditFeeModal = (
	props: Omit<React.ComponentProps<typeof FeeModal>, "mode"> & {
		feeId: string;
	},
) => <FeeModal {...props} mode="edit" />;

export default FeeModal;
