import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionIcon, Group, TextInput } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconGripVertical } from "@tabler/icons-react";
import { AssetClass, Fund } from "../../types";
import { DeleteButton } from "../ui/FormFields";
import classes from "../AssetClassSettings.module.css";
import commonClasses from "../../styles/common.module.css";

interface FundsListProps {
  funds: Fund[];
  assetClassIndex: number;
  form: UseFormReturnType<{ portfolio: AssetClass[] }>;
  onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
  onReorderFunds: (assetClassIndex: number, from: number, to: number) => void;
}

// An asset class's funds, which can be dragged into a new order. Each asset
// class has its own list, so a fund stays in its asset class.
export function FundsList({
  funds,
  assetClassIndex,
  form,
  onRemoveFund,
  onReorderFunds,
}: FundsListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = funds.findIndex((fund) => fund.key === active.id);
    const to = funds.findIndex((fund) => fund.key === over.id);
    onReorderFunds(assetClassIndex, from, to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={funds.map((fund) => fund.key)}
        strategy={verticalListSortingStrategy}
      >
        {funds.map((fund, fundIdx) => (
          <SortableFundItem
            key={fund.key}
            fund={fund}
            assetClassIndex={assetClassIndex}
            fundIndex={fundIdx}
            form={form}
            onRemoveFund={onRemoveFund}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}

interface SortableFundItemProps {
  fund: Fund;
  assetClassIndex: number;
  fundIndex: number;
  form: UseFormReturnType<{ portfolio: AssetClass[] }>;
  onRemoveFund: (assetClassIndex: number, fundIndex: number) => void;
}

function SortableFundItem({
  fund,
  assetClassIndex,
  fundIndex,
  form,
  onRemoveFund,
}: SortableFundItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fund.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Group
      ref={setNodeRef}
      style={style}
      className={classes.fundItem}
      wrap="nowrap"
    >
      <ActionIcon
        {...attributes}
        {...listeners}
        variant="subtle"
        color="gray"
        className={commonClasses.dragHandle}
        aria-label={`Drag to reorder ${fund.ticker || "fund"}`}
      >
        <IconGripVertical size={18} />
      </ActionIcon>
      {/* Fills the row on mobile; keeps its natural width from sm up */}
      <TextInput
        placeholder="VTI"
        aria-label="Ticker"
        className={commonClasses.uppercaseInput}
        flex={{ base: 1, sm: "none" }}
        {...form.getInputProps(
          `portfolio.${assetClassIndex}.funds.${fundIndex}.ticker`,
        )}
        data-testid={`fund-ticker-${assetClassIndex}-${fundIndex}`}
      />
      <DeleteButton
        size="md"
        onClick={() => {
          onRemoveFund(assetClassIndex, fundIndex);
        }}
        aria-label={`Delete fund ${fund.ticker || "ticker"}`}
      />
    </Group>
  );
}
