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
import CommonSelect from "@/components/forms/select/select";
import { Icon } from "@/components/ui";

interface PriorityRoutingOrderProps {
	psps: Array<{ id: string; pspId: string }>;
	onPspsChange: (psps: Array<{ id: string; pspId: string }>) => void;
	pspOptions: Array<{ label: string; value: string }>;
	errors: Record<string, string>;
	onValidatePSP: (pspId: string, currentId: string) => void;
}

// Sortable Item Component
interface SortableItemProps {
	psp: string;
	index: number;
	pspOptions: Array<{ label: string; value: string }>;
	errors: Record<string, string>;
	onUpdatePSP: (index: number, pspId: string) => void;
	onValidatePSP: (pspId: string, currentId: string) => void;
	onRemovePSP: (index: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
	psp,
	index,
	pspOptions,
	errors,
	onUpdatePSP,
	onValidatePSP,
	onRemovePSP,
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: `psp-${index}` });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<Box
			bg="white"
			border="1px solid"
			borderColor={isDragging ? "blue.300" : "gray.200"}
			borderRadius="md"
			p={4}
			ref={setNodeRef}
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
						errorMessage={errors[`psp-${index}-psp`]}
						isInvalid={!!errors[`psp-${index}-psp`]}
						label="PSP"
						onChange={(value: string) => {
							onUpdatePSP(index, value);
							onValidatePSP(value, `psp-${index}`);
						}}
						options={pspOptions}
						placeholder="Select PSP"
						value={pspOptions.some((option) => option.value === psp) ? psp : ""}
					/>
				</Box>

				{/* Delete Button */}
				<IconButton
					aria-label="Remove PSP"
					colorScheme="red"
					onClick={() => onRemovePSP(index)}
					size="sm"
					variant="ghost"
				>
					<Icon color="red" name="trash" />
				</IconButton>
			</HStack>
		</Box>
	);
};

const PriorityRoutingOrder: React.FC<PriorityRoutingOrderProps> = ({
	psps,
	onPspsChange,
	pspOptions,
	errors,
	onValidatePSP,
}) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = psps.findIndex(
				(_, index) => `psp-${index}` === active.id,
			);
			const newIndex = psps.findIndex((_, index) => `psp-${index}` === over.id);

			onPspsChange(arrayMove(psps, oldIndex, newIndex));
		}
	};

	const addPSP = () => {
		onPspsChange([...psps, { id: `psp-${psps.length + 1}`, pspId: "" }]);
	};

	const removePSP = (index: number) => {
		const updatedPsps = psps.filter((_, i) => i !== index);
		onPspsChange(updatedPsps);
	};

	const updatePSP = (index: number, pspId: string) => {
		const updatedPsps = [...psps];
		updatedPsps[index] = { id: `psp-${index + 1}`, pspId };
		onPspsChange(updatedPsps);

		// Validate with the updated PSPs array
		onValidatePSP(pspId, `psp-${index}`);
	};

	return (
		<DndContext
			collisionDetection={closestCenter}
			modifiers={[restrictToVerticalAxis, restrictToParentElement]}
			onDragEnd={handleDragEnd}
			sensors={sensors}
		>
			<SortableContext
				items={psps.map((_, index) => `psp-${index}`)}
				strategy={verticalListSortingStrategy}
			>
				<VStack align="stretch" gap={3}>
					{psps.map((psp, index) => (
						<SortableItem
							errors={errors}
							index={index}
							key={`psp-${psp.pspId || "empty"}-${index}`}
							onRemovePSP={removePSP}
							onUpdatePSP={updatePSP}
							onValidatePSP={onValidatePSP}
							psp={psp.pspId}
							pspOptions={pspOptions}
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

export default PriorityRoutingOrder;
