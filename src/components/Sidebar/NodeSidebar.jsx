import React from "react";
import PropTypes, { object } from "prop-types";
import "./NodeSidebar.css";

export default function NodeSidebar({
  selectedNodeData,
  onChangeTitle,
  onChangeDescription,
  onAddCarouselCard,
  onUpdateFormFields,
  onClose,
}) {
  if (!selectedNodeData) return null;

  const nodeType = selectedNodeData.data.type;
  const fields = selectedNodeData.data.fields ?? [];

  const handleFieldLabelChange = (fieldId, newLabel) => {
    const updated = fields.map((f) =>
      f.id === fieldId ? { ...f, label: newLabel } : f
    );
    onUpdateFormFields(updated);
  };

  const handleFieldTypeChange = (fieldId, newType) => {
    const updated = fields.map((f) =>
      f.id === fieldId ? { ...f, type: newType } : f
    );
    onUpdateFormFields(updated);
  };

  const handleAddField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
    };
    onUpdateFormFields([...fields, newField]);
  };

  const handleRemoveField = (fieldId) => {
    onUpdateFormFields(fields.filter((f) => f.id !== fieldId));
  };

  return (
    <aside className="node-sidebar">
      <div className="node-sidebar__header">
        <h3 className="node-sidebar__title">Node Config</h3>
        <button
          type="button"
          className="node-sidebar__close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <label className="node-sidebar__label">
        Title
        <input
          className="node-sidebar__input"
          value={selectedNodeData.data.title ?? ""}
          onChange={(event) => onChangeTitle(event.target.value)}
        />
      </label>

      <label className="node-sidebar__label">
        Description
        <textarea
          className="node-sidebar__textarea"
          value={selectedNodeData.data.description ?? ""}
          onChange={(event) => onChangeDescription(event.target.value)}
        />
      </label>

      {nodeType === "carousel" && (
        <button
          type="button"
          className="node-sidebar__add-card-button"
          onClick={onAddCarouselCard}
        >
          + Add Card
        </button>
      )}

      {nodeType === "form" && (
        <div className="node-sidebar__form-fields">
          <p className="node-sidebar__section-title">Form Fields</p>

          {fields.map((field) => (
            <div key={field.id} className="node-sidebar__field-row">
              <input
                className="node-sidebar__input node-sidebar__field-label"
                value={field.label}
                onChange={(e) => handleFieldLabelChange(field.id, e.target.value)}
                placeholder="Field label"
              />
              <select
                className="node-sidebar__field-type"
                value={field.type}
                onChange={(e) => handleFieldTypeChange(field.id, e.target.value)}
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
                onClick={() => handleRemoveField(field.id)}
                aria-label="Remove field"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            className="node-sidebar__add-field-button"
            onClick={handleAddField}
          >
            + Add Field
          </button>
        </div>
      )}
    </aside>
  );
}

NodeSidebar.propTypes = {
  selectedNodeData: object,
  onChangeTitle: PropTypes.func.isRequired,
  onChangeDescription: PropTypes.func.isRequired,
  onAddCarouselCard: PropTypes.func.isRequired,
  onUpdateFormFields: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

NodeSidebar.defaultProps = {
  selectedNodeData: null,
};
