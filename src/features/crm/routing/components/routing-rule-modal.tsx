import { Box, Button, HStack, Spinner, Text, VStack } from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useCallback, useState } from "react";
import type { RoutingRule } from "@/api/service.types";
import { RoutingRulesService } from "@/api/services";
import { Modal } from "@/components/ui/Modal/modal";
import { useBrandEnvironment } from "@/hooks/use-brand-environment";
import { routingRuleQueryKeys } from "../helpers/query-keys";
import type {
	RoutingRuleCreatePayload,
	RoutingRuleFormData,
	RoutingRuleUpdatePayload,
} from "../types";

// Extended interface for edit mode with additional fields
interface RoutingRuleWithFormFields extends RoutingRule {
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH";
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
}

import RoutingRuleForm from "./routing-rule-form";

interface RoutingRuleModalProps {
	isOpen: boolean;
	onClose: () => void;
	mode: "create" | "edit";
	ruleId?: number; // Integer from database
}

const RoutingRuleModal: React.FC<RoutingRuleModalProps> = ({
	isOpen,
	onClose,
	mode,
	ruleId,
}) => {
	const queryClient = useQueryClient();
	const { selectedBrand, selectedEnvironment } = useBrandEnvironment();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [clearFormRef, setClearFormRef] = useState<(() => void) | null>(null);

	// Stable callback to set the clear form reference
	const handleSetClearFormRef = useCallback((clearFn: () => void) => {
		setClearFormRef(() => clearFn);
	}, []);

	// Fetch routing rule data for edit mode
	const { data: ruleData, isLoading: isLoadingRule } = useQuery({
		queryKey: routingRuleQueryKeys.detail(ruleId ? String(ruleId) : ""),
		queryFn: () => {
			if (!ruleId) {
				throw new Error("Rule ID is required for edit mode");
			}
			return RoutingRulesService.getRoutingRuleById(ruleId);
		},
		enabled: mode === "edit" && !!ruleId && isOpen,
		select: (data) => data?.data,
	});

	// Create routing rule mutation
	const createRuleMutation = useMutation({
		mutationFn: (formData: RoutingRuleFormData) => {
			const brandId = selectedBrand?.id;
			const environmentId = selectedEnvironment?.id;
			if (!(brandId && environmentId)) {
				throw new Error("Brand or environment not selected");
			}

			// Transform form data to API payload
			// brandId and environmentId are automatically added via headers
			const apiPayload: RoutingRuleCreatePayload = {
				name: formData.name,
				pspSelectionMode: formData.pspSelectionMode,
				conditionJson: formData.conditionJson,
				psps: formData.psps.map((psp, index) => ({
					pspId: psp.pspId,
					pspOrder: index + 1,
					pspValue: "pspValue" in psp ? psp.pspValue : 0,
				})),
				// Add routing type and duration for WEIGHTAGE mode
				...(formData.pspSelectionMode === "WEIGHTAGE" && {
					routingType: formData.rule as "COUNT" | "AMOUNT" | "PERCENTAGE",
					duration: formData.time as "HOUR" | "DAY" | "WEEK" | "MONTH",
				}),
			};

			return RoutingRulesService.createRoutingRule(apiPayload);
		},
		onSuccess: () => {
			// Invalidate and refetch routing rules
			queryClient.invalidateQueries({
				queryKey: routingRuleQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				),
			});
			onClose();
		},
		onError: (error) => {
			console.error("Error creating routing rule:", error);
		},
	});

	// Update routing rule mutation
	const updateRuleMutation = useMutation({
		mutationFn: ({
			id,
			data: formData,
		}: {
			id: number;
			data: RoutingRuleFormData;
		}) => {
			const brandId = selectedBrand?.id;
			const environmentId = selectedEnvironment?.id;
			if (!(brandId && environmentId)) {
				throw new Error("Brand or environment not selected");
			}

			// Transform form data to API payload
			// brandId and environmentId are automatically added via headers
			const apiPayload: RoutingRuleUpdatePayload = {
				name: formData.name,
				pspSelectionMode: formData.pspSelectionMode,
				conditionJson: formData.conditionJson,
				psps: formData.psps.map((psp, index) => ({
					pspId: psp.pspId,
					pspOrder: index + 1,
					pspValue: "pspValue" in psp ? psp.pspValue : 0,
				})),
				// Add routing type and duration for WEIGHTAGE mode
				...(formData.pspSelectionMode === "WEIGHTAGE" && {
					routingType: formData.rule as "COUNT" | "AMOUNT" | "PERCENTAGE",
					duration: formData.time as "HOUR" | "DAY" | "WEEK" | "MONTH",
				}),
			};

			return RoutingRulesService.updateRoutingRule(id, apiPayload);
		},
		onSuccess: () => {
			// Invalidate and refetch routing rules
			queryClient.invalidateQueries({
				queryKey: routingRuleQueryKeys.list(
					selectedBrand?.id || "",
					selectedEnvironment?.id || "",
				),
			});
			queryClient.invalidateQueries({
				queryKey: routingRuleQueryKeys.detail(ruleId ? String(ruleId) : ""),
			});
			onClose();
		},
		onError: (error) => {
			console.error("Error updating routing rule:", error);
		},
	});

	const handleSubmit = async (data: RoutingRuleFormData) => {
		setIsSubmitting(true);

		try {
			if (mode === "create") {
				await createRuleMutation.mutateAsync(data);
			} else if (mode === "edit" && ruleId) {
				await updateRuleMutation.mutateAsync({ id: ruleId, data });
			}
		} catch {
			// Error handling is done in the mutation onError callbacks
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		if (!isSubmitting) {
			// Clear form when closing modal
			if (clearFormRef && mode === "create") {
				clearFormRef();
			}
			onClose();
		}
	};

	// Prepare initial data for edit mode
	const getInitialData = (): Partial<RoutingRuleFormData> | undefined => {
		if (mode === "edit" && ruleData) {
			return {
				name: ruleData.name,
				pspSelectionMode: ruleData.pspSelectionMode,
				conditionJson:
					typeof ruleData.conditionJson === "string"
						? {}
						: ruleData.conditionJson,
				status: ruleData.status,
				psps: ruleData.psps.map((psp) => ({
					pspId: psp.pspId,
					pspOrder: psp.pspOrder,
					pspValue: psp.pspValue ?? 0,
				})),
				isDefault: false, // Not in API response
				// Map API fields to form fields
				time:
					(ruleData as unknown as RoutingRuleWithFormFields).duration || "DAY",
				rule:
					(ruleData as unknown as RoutingRuleWithFormFields).routingType ||
					"COUNT",
			};
		}
		return;
	};

	const getModalTitle = () => {
		return mode === "create" ? "Add Routing Rule" : "Edit Routing Rule";
	};

	const isLoading = mode === "edit" && isLoadingRule;
	const isMutationLoading =
		createRuleMutation.isPending || updateRuleMutation.isPending;

	return (
		<Modal
			footer={
				<HStack gap={6} justify="flex-end" mt={6} width="100%">
					<Button
						bg="bg.muted"
						borderColor="secondary.solid"
						color="secondary.solid"
						onClick={onClose}
						variant="outline"
						w="20%"
					>
						Cancel
					</Button>
					<Button
						bg="secondary.solid"
						color="secondary.contrast"
						loading={isMutationLoading || isSubmitting}
						onClick={() => {
							// Trigger form submission
							const form = document.querySelector("form");
							if (form) {
								form.requestSubmit();
							}
						}}
						w="20%"
					>
						{mode === "create" ? "Add Rule" : "Update Rule"}
					</Button>
				</HStack>
			}
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			title={getModalTitle()}
		>
			<Box>
				{isLoading ? (
					<VStack gap={4} py={8}>
						<Spinner color="primary.500" size="lg" />
						<Text color="gray.600">Loading routing rule...</Text>
					</VStack>
				) : (
					<RoutingRuleForm
						initialData={getInitialData()}
						isLoading={isMutationLoading || isSubmitting}
						mode={mode}
						onCancel={handleClose}
						onClear={handleSetClearFormRef}
						onSubmit={handleSubmit}
					/>
				)}
			</Box>
		</Modal>
	);
};

export default RoutingRuleModal;
