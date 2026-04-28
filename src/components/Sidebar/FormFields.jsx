import PropTypes from "prop-types";
import React from "react";
import AppInput from "../Common/AppInput";

export default function FormFields({ nodeData, formHandlers }) {
  const fields = nodeData.fields ?? [];

  return (
    <div className="node-sidebar__form-fields">
      <p className="node-sidebar__section-title">Form Fields</p>

      {fields.map((field) => (
        <div key={field.id} className="node-sidebar__field-row">
          <AppInput
            className="node-sidebar__input node-sidebar__field-label"
            value={field.label}
            onChange={(e) =>
              formHandlers.updateFieldLabel(field.id, e.target.value)
            }
            placeholder="Field label"
          />
          <select
            className="node-sidebar__field-type"
            value={field.type}
            onChange={(e) =>
              formHandlers.updateFieldType(field.id, e.target.value)
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
            onClick={() => formHandlers.removeField(field.id)}
            aria-label="Remove field"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

FormFields.propTypes = {
  nodeData: PropTypes.object,
  formHandlers: PropTypes.shape({
    updateFieldLabel: PropTypes.func,
    updateFieldType: PropTypes.func,
    removeField: PropTypes.func,
  }).isRequired,
};
