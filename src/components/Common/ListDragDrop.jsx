import React, { useCallback, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";
import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";

const SortableItem = React.memo(({ id, renderItem }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
            padding: "12px",
            margin: "8px 0",
            background: isDragging ? "#e0f7fa" : "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            willChange: "transform",
        }),
        [transform, transition, isDragging],
    );

    return (
        <div ref={setNodeRef} style={style}>
            {renderItem({
                dragHandleProps: attributes,
                dragListeners: listeners,
            })}
        </div>
    );
});

SortableItem.displayName = "SortableItem";

SortableItem.propTypes = {
    id: PropTypes.string,
    renderItem: PropTypes.array,
};

export default function DragDropList({
    items,
    setItems,
    getId = (item) => item.id,
    renderItem,
}) {
    //  stable ids
    const itemIds = useMemo(() => items.map(getId), [items, getId]);

    //  drag handler
    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            const oldIndex = items.findIndex((i) => getId(i) === active.id);
            const newIndex = items.findIndex((i) => getId(i) === over.id);

            const newArray = arrayMove(items, oldIndex, newIndex);

            setItems(newArray);
        },
        [items, setItems, getId],
    );

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {items.map((item) => {
                    const id = getId(item);
                    return (
                        <SortableItem
                            key={id}
                            id={id}
                            renderItem={(dragProps) => renderItem(item, dragProps)}
                        />
                    );
                })}
            </SortableContext>
        </DndContext>
    );
}

DragDropList.propTypes = {
    renderItem: PropTypes,
    items: PropTypes.array,
    setItems: PropTypes.setItems,
    getId: PropTypes.func,
};
