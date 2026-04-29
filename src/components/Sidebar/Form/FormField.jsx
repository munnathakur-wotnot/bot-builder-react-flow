import React, { useCallback } from "react";
import PropTypes from "prop-types";
import AppInput from "../../Common/AppInput";

const FieldRow = React.memo(function FieldRow({
    field,
    onLabelChange,
    onTypeChange,
    onRemove,
    dragHandleProps,
    dragListeners,
}) {
    console.log(dragHandleProps, "HeklloDragHandlerProps");
    const handleLabelChange = useCallback(
        (e) => {
            console.log(e, field.id, "InLabelChange");

            onLabelChange(field.id, e.target.value);
        },
        [field.id, onLabelChange],
    );

    const handleTypeChange = useCallback(
        (e) => onTypeChange(field.id, e.target.value),
        [field.id, onTypeChange],
    );

    const handleRemove = useCallback(
        () => onRemove(field.id),
        [field.id, onRemove],
    );

    return (
        <div className="node-sidebar__field-row">
            <span
                {...dragHandleProps}
                {...dragListeners}
                style={{
                    cursor: "grab",
                    padding: "4px",
                    marginRight: "8px",
                }}
            >
                ☰
            </span>
            <AppInput
                className="node-sidebar__input node-sidebar__field-label"
                value={field.label}
                onChange={handleLabelChange}
                placeholder="Field label"
            />

            <select
                className="node-sidebar__field-type"
                value={field.type}
                onChange={handleTypeChange}
            >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
            </select>

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
    onLabelChange: PropTypes.func.isRequired,
    onTypeChange: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    dragHandleProps: PropTypes.object,
    dragListeners: PropTypes.object,
};

export default FieldRow;
