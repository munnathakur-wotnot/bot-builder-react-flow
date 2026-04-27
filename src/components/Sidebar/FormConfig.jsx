import PropTypes from "prop-types";
import React from "react";

export default function FormConfig({ nodeData, updateNode }) {
  const fields = nodeData.fields ?? [];
  const updateFields = (updated) => updateNode({ fields: updated });

  return (
    <div className="node-sidebar__form-fields">
      <p className="node-sidebar__section-title">Form Fields</p>

      {fields.map((field) => (
        <div key={field.id} className="node-sidebar__field-row">
          <input
            className="node-sidebar__input node-sidebar__field-label"
            value={field.label}
            onChange={(e) =>
              updateFields(
                fields.map((f) =>
                  f.id === field.id ? { ...f, label: e.target.value } : f,
                ),
              )
            }
            placeholder="Field label"
          />
          <select
            className="node-sidebar__field-type"
            value={field.type}
            onChange={(e) =>
              updateFields(
                fields.map((f) =>
                  f.id === field.id ? { ...f, type: e.target.value } : f,
                ),
              )
            }
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
            onClick={() =>
              updateFields(fields.filter((f) => f.id !== field.id))
            }
            aria-label="Remove field"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="node-sidebar__add-field-button"
        onClick={() =>
          updateFields([
            ...fields,
            { id: `field_${Date.now()}`, label: "New Field", type: "text" },
          ])
        }
      >
        + Add Field
      </button>
    </div>
  );
}

FormConfig.propTypes = {
  nodeData: PropTypes.object,
  updateNode: PropTypes.func,
};
