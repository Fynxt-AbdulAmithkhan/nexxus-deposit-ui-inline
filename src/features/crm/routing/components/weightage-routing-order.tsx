import {
	Box,
	Button,
	HStack,
	IconButton,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	restrictToParentElement,
	restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type React from "react";
import { useState } from "react";
import NumberInput from "@/components/forms/number-input/number-input";
import CommonSelect from "@/components/forms/select/select";
import { Icon } from "@/components/ui";

interface PSPItem {
	id: string;
	pspId: string;
	pspValue: number;
}

interface WeightageRoutingOrderProps {
	psps: PSPItem[];
	onPspsChange: (psps: PSPItem[]) => void;
	pspOptions: Array<{ label: string; value: string }>;
	ruleType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
}

// Sortable Item Component
interface SortableItemProps {
	psp: PSPItem;
	index: number;
	pspOptions: Array<{ label: string; value: string }>;
	errors: Record<string, string>;
	onUpdatePSP: (
		id: string,
		field: "pspId" | "pspValue",
		value: string | number,
	) => void;
	onValidatePSP: (pspId: string, currentId: string) => void;
	onValidateCount: (id: string, count: number) => void;
	onRemovePSP: (id: string) => void;
	ruleType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
}

const SortableItem: React.FC<SortableItemProps> = ({
	psp,
	index,
	pspOptions,
	errors,
	onUpdatePSP,
	onValidatePSP,
	onValidateCount,
	onRemovePSP,
	ruleType,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: psp.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	// Get the appropriate label based on rule type
	const valueLabel = {
		COUNT: "Count",
		AMOUNT: "Amount",
		PERCENTAGE: "Percentage (%)",
	}[ruleType || "COUNT"];

	return (
		<Box
			bg="white"
			border="1px solid"
			borderColor={isDragging ? "blue.300" : "gray.200"}
			borderRadius="md"
			p={4}
			ref={setNodeRef}
			// shadow={isDragging ? 'md' : 'sm'}
			style={style}
			transition="all 0.2s"
		>
			<HStack align="center" gap={4}>
				{/* Drag Handle */}
				<Box
					{...attributes}
					{...listeners}
					_active={{ cursor: "grabbing" }}
					color="gray.400"
					cursor="grab"
					fontSize="lg"
				>
					⋮⋮
				</Box>

				{/* Order Number */}
				<Text
					color="gray.600"
					fontSize="sm"
					fontWeight="medium"
					minWidth="20px"
				>
					{String(index + 1).padStart(2, "0")}
				</Text>

				{/* PSP Selection */}
				<Box flex="1" minW="0">
					<CommonSelect
						errorMessage={errors[`${psp.id}-psp`]}
						isInvalid={!!errors[`${psp.id}-psp`]}
						label="PSP"
						onChange={(value: string) => {
							onUpdatePSP(psp.id, "pspId", value);
							onValidatePSP(value, psp.id);
						}}
						options={pspOptions}
						placeholder="Select PSP"
						value={
							pspOptions.some((option) => option.value === psp.pspId)
								? psp.pspId
								: ""
						}
					/>
				</Box>

				{/* Count Input */}
				<Box minWidth="120px">
					<NumberInput
						errorMessage={errors[`${psp.id}-count`]}
						isInvalid={!!errors[`${psp.id}-count`]}
						label={valueLabel}
						min={0}
						onChange={(value: string) => {
							onUpdatePSP(psp.id, "pspValue", value);
							onValidateCount(psp.id, Number(value));
						}}
						placeholder="0"
						value={psp.pspValue.toString()}
					/>
				</Box>

				{/* Delete Button */}
				<IconButton
					aria-label="Remove PSP"
					colorScheme="red"
					onClick={() => onRemovePSP(psp.id)}
					size="sm"
					variant="ghost"
				>
					<Icon color="red" name="trash" />
				</IconButton>
			</HStack>
		</Box>
	);
};

const WeightageRoutingOrder: React.FC<WeightageRoutingOrderProps> = ({
	psps,
	onPspsChange,
	pspOptions,
	ruleType,
}) => {
	const [errors, setErrors] = useState<Record<string, string>>({});

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = psps.findIndex((item) => item.id === active.id);
			const newIndex = psps.findIndex((item) => item.id === over.id);

			onPspsChange(arrayMove(psps, oldIndex, newIndex));
		}
	};

	const addPSP = () => {
		const newId = `psp-${Date.now()}`;
		const newPSP: PSPItem = {
			id: newId,
			pspId: "",
			pspValue: 0,
		};
		onPspsChange([...psps, newPSP]);
	};

	const removePSP = (id: string) => {
		onPspsChange(psps.filter((psp) => psp.id !== id));
	};

	const updatePSP = (
		id: string,
		field: "pspId" | "pspValue",
		value: string | number,
	) => {
		const updatedPsps = psps.map((psp) =>
			psp.id === id ? { ...psp, [field]: value } : psp,
		);
		onPspsChange(updatedPsps);

		// Clear error when user makes changes
		if (field === "pspId" && value) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[`${id}-psp`];
				return newErrors;
			});
		}
		if (field === "pspValue" && typeof value === "number" && value > 0) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[`${id}-count`];
				return newErrors;
			});
		}
	};

	const validatePSP = (pspId: string, currentId: string) => {
		if (!pspId) {
			setErrors((prev) => ({
				...prev,
				[`${currentId}-psp`]: "PSP is required",
			}));
			return false;
		}

		// Check for duplicates - exclude the current item being validated
		const duplicateCount = psps.filter(
			(psp) => psp.pspId === pspId && psp.id !== currentId,
		).length;
		if (duplicateCount > 0) {
			setErrors((prev) => ({
				...prev,
				[`${currentId}-psp`]: "PSP already selected",
			}));
			return false;
		}

		// Clear error if validation passes
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[`${currentId}-psp`];
			return newErrors;
		});
		return true;
	};

	const validateCount = (id: string, count: number) => {
		if (count < 0) {
			setErrors((prev) => ({
				...prev,
				[`${id}-count`]: "Count must be non-negative",
			}));
			return false;
		}

		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[`${id}-count`];
			return newErrors;
		});
		return true;
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<SortableContext
				items={psps.map((psp) => psp.id)}
				strategy={verticalListSortingStrategy}
			>
				<VStack align="stretch" gap={3}>
					{psps.map((psp, index) => (
						<SortableItem
							errors={errors}
							index={index}
							key={psp.id}
							onRemovePSP={removePSP}
							onUpdatePSP={updatePSP}
							onValidateCount={validateCount}
							onValidatePSP={validatePSP}
							psp={psp}
							pspOptions={pspOptions}
							ruleType={ruleType}
						/>
					))}

					{/* Add Button */}
					<Button
						alignSelf="flex-start"
						colorScheme="blue"
						onClick={addPSP}
						size="sm"
						variant="outline"
					>
						+ Add PSP
					</Button>
				</VStack>
			</SortableContext>
		</DndContext>
	);
};

export default WeightageRoutingOrder;
