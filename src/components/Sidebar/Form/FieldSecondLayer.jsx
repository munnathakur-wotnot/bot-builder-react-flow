import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import AppInput from "../../Common/AppInput";
import useDebouncedCallback from "../../../hooks/useDebouncedCallback";

export default function FieldSecondLayer({ field, onLabelChange, onTypeChange }) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [type, setType] = useState(field?.type ?? "text");
  const lastRef = useRef({ label: field?.label ?? "", type: field?.type ?? "text" });

  const { debounced: debouncedLabelChange, cancel: cancelLabel } =
    useDebouncedCallback((id, value) => onLabelChange(id, value), 200);

  // Sync when the selected field changes
  useEffect(() => {
    const nextLabel = field?.label ?? "";
    const nextType = field?.type ?? "text";
    setLabel(nextLabel);
    setType(nextType);
    lastRef.current = { label: nextLabel, type: nextType };
    cancelLabel();
  }, [field?.id, cancelLabel]);

  const handleLabelChange = useCallback(
    (e) => {
      setLabel(e.target.value);
      debouncedLabelChange(field.id, e.target.value);
    },
    [field?.id, debouncedLabelChange],
  );

  const handleTypeChange = useCallback(
    (e) => {
      setType(e.target.value);
      onTypeChange(field.id, e.target.value);
    },
    [field?.id, onTypeChange],
  );

  if (!field) return null;

  return (
    <div className="node-sidebar__second-layer-content">
      <p className="node-sidebar__section-title">Field Settings</p>
      <label className="node-sidebar__label">
        Label
        <AppInput
          className="node-sidebar__input"
          value={label}
          onChange={handleLabelChange}
          placeholder="Field label"
        />
      </label>
      <label className="node-sidebar__label">
        Type
        <select
          className="node-sidebar__field-type"
          value={type}
          onChange={handleTypeChange}
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="tel">Phone</option>
          <option value="number">Number</option>
          <option value="date">Date</option>
        </select>
      </label>
    </div>
  );
}

FieldSecondLayer.propTypes = {
  field: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    type: PropTypes.string,
  }),
  onLabelChange: PropTypes.func.isRequired,
  onTypeChange: PropTypes.func.isRequired,
};
