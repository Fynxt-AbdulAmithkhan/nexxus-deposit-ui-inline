import { Box, Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useTranslation } from "react-i18next";
import type {
	RiskRule,
	RiskRuleCreatePayload,
	RiskRuleUpdatePayload,
} from "@/api/service.types";
import { RiskService } from "@/api/services";
import { Modal } from "@/components/ui/Modal/modal";
import { useInvalidateCommonPSPQueries } from "@/helpers/query.helper";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { useRiskRuleQuery } from "../hooks/use-risk-rule-queries";
import type { RiskRuleModalProps } from "../types";
import RiskRuleForm from "./risk-rule-modal-form";

const RiskRuleModal: React.FC<RiskRuleModalProps> = ({
	isOpen,
	onClose,
	riskRuleId,
}): React.ReactElement => {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();
	const invalidateCommonPSPQueries = useInvalidateCommonPSPQueries();
	const isEditMode = !!riskRuleId;

	// Fetch risk rule data for edit mode
	const riskRuleQuery = useRiskRuleQuery(riskRuleId);

	// Create risk rule mutation
	const createRiskRuleMutation = useMutation({
		mutationFn: (riskRuleData: RiskRuleCreatePayload) => {
			if (!(selectedBrand?.id && selectedEnvironment?.id)) {
				throw new Error("Brand and environment must be selected");
			}

			// brandId and environmentId are automatically added via headers
			return RiskService.createRiskRule(riskRuleData);
		},
		onSuccess: (data) => {
			// Invalidate and refetch risk rules list
			if (data?.data) {
				queryClient.invalidateQueries({
					queryKey: ["riskRules"],
					exact: false,
				});
				invalidateCommonPSPQueries();
				onClose();
			}
		},
	});

	// Update risk rule mutation
	const updateRiskRuleMutation = useMutation({
		mutationFn: ({
			riskRuleId,
			riskRuleData,
		}: {
			riskRuleId: number;
			riskRuleData: RiskRuleUpdatePayload;
		}) => {
			if (!(selectedBrand?.id && selectedEnvironment?.id)) {
				throw new Error("Brand and environment must be selected");
			}

			// brandId and environmentId are automatically added via headers
			return RiskService.updateRiskRule(riskRuleId, riskRuleData);
		},
		onSuccess: (data) => {
			// Invalidate and refetch risk rules list
			if (data?.data) {
				queryClient.invalidateQueries({
					queryKey: ["riskRules"],
					exact: false,
				});
				invalidateCommonPSPQueries();
				onClose();
			}
		},
	});

	const handleSubmit = (
		data: RiskRuleCreatePayload | RiskRuleUpdatePayload,
	) => {
		const formData = data;

		if (isEditMode && riskRuleId) {
			updateRiskRuleMutation.mutate({ riskRuleId, riskRuleData: formData });
		} else {
			createRiskRuleMutation.mutate(formData);
		}
	};

	const getModalTitle = () => {
		return isEditMode
			? t("riskRules.editRiskRule")
			: t("riskRules.createRiskRule");
	};

	const getInitialData = ():
		| Partial<RiskRuleCreatePayload | RiskRuleUpdatePayload>
		| undefined => {
		if (!isEditMode) {
			return;
		}
		if (!riskRuleQuery.data) {
			return;
		}

		const riskRule = riskRuleQuery.data as RiskRule;

		const baseData = {
			name: riskRule.name,
			type: riskRule.type,
			action: riskRule.action,
			currency: riskRule.currency,
			duration: riskRule.duration,
			maxAmount: riskRule.maxAmount,
			flowActionId: riskRule.flowActionId,
			status: riskRule.status,
			psps: riskRule.psps,
		};

		if (riskRule.type === "DEFAULT") {
			return baseData;
		}

		return {
			...baseData,
			type: "CUSTOMER" as const,
			criteriaType: riskRule.criteriaType,
			criteriaValue: Array.isArray(riskRule.criteriaValue)
				? riskRule.criteriaValue
				: [riskRule.criteriaValue],
		};
	};

	const isLoading =
		createRiskRuleMutation.isPending || updateRiskRuleMutation.isPending;

	return (
		<Modal
			footer={
				<HStack gap={6} justify="flex-end" mt={6} width="100%">
					<Button onClick={onClose} variant="outline" w="20%">
						{t("common.cancel")}
					</Button>
					<Button
						form="risk-rule-form"
						loading={isLoading}
						type="submit"
						w="20%"
					>
						{isEditMode
							? t("riskRules.modals.editRiskRule")
							: t("riskRules.modals.createRiskRule")}
					</Button>
				</HStack>
			}
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={getModalTitle()}
		>
			<Box>
				{isEditMode && riskRuleQuery.isLoading && (
					<VStack gap={4} py={8}>
						<Spinner color="primary.500" size="lg" />
						<Text color="gray.600">
							{t("riskRules.modals.loadingRiskRule")}
						</Text>
					</VStack>
				)}

				{isEditMode && riskRuleQuery.isError && (
					<VStack gap={4} py={8}>
						<Text color="red.500" fontSize="lg" fontWeight="medium">
							{t("riskRules.errorLoadingRiskRule")}
						</Text>
						<Text color="gray.600" textAlign="center">
							{riskRuleQuery.error?.message ||
								t("riskRules.failedToLoadRiskRule")}
						</Text>
					</VStack>
				)}

				{(!isEditMode || (riskRuleQuery.data && !riskRuleQuery.isError)) && (
					<RiskRuleForm
						formId="risk-rule-form"
						initialData={getInitialData()}
						mode={isEditMode ? "edit" : "create"}
						onSubmit={handleSubmit}
					/>
				)}
			</Box>
		</Modal>
	);
};

export default RiskRuleModal;
