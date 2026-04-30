import React, { useCallback } from "react";
import PropTypes from "prop-types";

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
        <div className="node-sidebar__field-row">
            <span
                {...dragHandleProps}
                {...dragListeners}
                style={{ cursor: "grab", padding: "4px", marginRight: "8px" }}
            >
                ☰
            </span>

            <span className="node-sidebar__field-row-label">{field.label || "Untitled"}</span>
            <span className="node-sidebar__field-row-type">{field.type}</span>

            <button
                type="button"
                className="node-sidebar__field-chevron"
                onClick={handleOpen}
                aria-label="Edit field"
            >
                ›
            </button>

            <button
                type="button"
                className="node-sidebar__field-remove"
                onClick={handleRemove}
                aria-label="Remove field"
            >
                ×
            </button>
        </div>
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
