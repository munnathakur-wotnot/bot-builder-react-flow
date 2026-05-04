import React, { useCallback } from "react";
import PropTypes from "prop-types";
import DraggableRow from "../../../../shared/ui/molecules/DraggableRow";

const FieldRow = React.memo(function FieldRow({
    field,
    onRemove,
    onNavigate,
    dragHandleProps,
    dragListeners,
}) {
    const handleRemove = useCallback(
        () => onRemove(field.id),
        [field.id, onRemove],
    );

    const handleOpen = useCallback(
        () => onNavigate?.(field),
        [field, onNavigate],
    );

    return (
        <DraggableRow
            dragHandleProps={dragHandleProps}
            dragListeners={dragListeners}
            onNavigate={handleOpen}
            onRemove={handleRemove}
        >
            <span className="field-row__label">{field.label || "Untitled"}</span>
            <span className="field-row__type-badge">{field.type}</span>
        </DraggableRow>
    );
});

FieldRow.propTypes = {
    field: PropTypes.object.isRequired,
    onRemove: PropTypes.func.isRequired,
    onNavigate: PropTypes.func,
    dragHandleProps: PropTypes.object,
    dragListeners: PropTypes.object,
};

export default FieldRow;
