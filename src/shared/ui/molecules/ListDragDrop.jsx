import React, { useCallback, useMemo, useRef } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { validateAllNodesKeys } from "../../../features/canvas/validateNodes";
import { getIdForKnowError } from "./moleculeshelper";

const SortableItem = React.memo(({ id, renderItem, type, nodeData }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const validateData = validateAllNodesKeys(nodeData, "sidebar");

    const isError = getIdForKnowError({ type, validateData, id, nodeData });

    const style = useMemo(
        () => ({
            transform: CSS.Transform.toString(transform),
            transition,
            padding: "12px",
            margin: "8px 0",
            background: isDragging ? "#e0f7fa" : "#fff",
            border: isError ? "1px solid red" : "1px solid #ddd",
            borderRadius: "8px",
            willChange: "transform",
        }),
        [transform, transition, isDragging, isError],
    );

    return (
        <div ref={setNodeRef} style={style}>
            <div>
                {renderItem({
                    dragHandleProps: attributes,
                    dragListeners: listeners,
                })}
            </div>
            {isError && (
                <p
                    style={{
                        color: "red",
                        padding: 0,
                        height: "5px",
                        marginTop: "0px",
                    }}
                >
                    Someting worng
                </p>
            )}
        </div>
    );
});

SortableItem.displayName = "SortableItem";

SortableItem.propTypes = {
    id: PropTypes.string,
    renderItem: PropTypes.array,
    type: PropTypes.string,
    nodeData: PropTypes.object,
};

export default function DragDropList({
    items,
    setItems,
    getId = (item) => item.id,
    renderItem,
}) {
    const containerRef = useRef(null);

    //  stable ids
    const itemIds = useMemo(() => items.list.map(getId), [items.list, getId]);

    // Custom modifier: restrict drag movement to the list container bounds
    const restrictToContainer = useCallback(({ transform, draggingNodeRect }) => {
        if (!containerRef.current || !draggingNodeRect) return transform;

        const containerRect = containerRef.current.getBoundingClientRect();
        const minY = containerRect.top - draggingNodeRect.top;
        const maxY = containerRect.bottom - draggingNodeRect.bottom;

        return {
            ...transform,
            x: 0,
            y: Math.min(Math.max(transform.y, minY), maxY),
        };
    }, []);

    //  drag handler
    const handleDragEnd = useCallback(
        (event) => {
            const { active, over } = event;

            if (!over || active.id === over.id) return;

            const oldIndex = items?.list.findIndex((i) => getId(i) === active.id);
            const newIndex = items?.list.findIndex((i) => getId(i) === over.id);

            const newArray = arrayMove(items.list, oldIndex, newIndex);

            setItems(newArray);
        },
        [items?.list, setItems, getId],
    );

    return (
        <div ref={containerRef}>
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToContainer]}
            >
                <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                    {items?.list.map((item) => {
                        const id = getId(item);
                        return (
                            <SortableItem
                                key={id}
                                id={id}
                                type={items.type}
                                nodeData={items.nodeData}
                                renderItem={(dragProps) => renderItem(item, dragProps)}
                            />
                        );
                    })}
                </SortableContext>
            </DndContext>
        </div>
    );
}

DragDropList.propTypes = {
    renderItem: PropTypes,
    items: PropTypes.array,
    setItems: PropTypes.setItems,
    getId: PropTypes.func,
    type: PropTypes.string,
    nodeData: PropTypes.object,
};
