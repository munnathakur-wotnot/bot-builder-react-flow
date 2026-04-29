import PropTypes from "prop-types";
import React from "react";
import DragDropList from "../Common/ListDragDrop";
import FieldRow from "./Form/FormField";

export default function FormFields({ nodeData, formHandlers }) {
  const fields = nodeData.fields ?? [];

  return (
    <div className="node-sidebar__form-fields">
      <p className="node-sidebar__section-title">Form Fields</p>

      <DragDropList
        items={fields}
        setItems={formHandlers.reorderFields}
        renderItem={(field, { dragHandleProps, dragListeners }) => (
          <FieldRow
            field={field}
            dragHandleProps={dragHandleProps}
            dragListeners={dragListeners}
            onLabelChange={formHandlers.updateFieldLabel}
            onTypeChange={formHandlers.updateFieldType}
            onRemove={formHandlers.removeField}
          />
        )}
      />
    </div>
  );
}

FormFields.propTypes = {
  nodeData: PropTypes.object,
  formHandlers: PropTypes.shape({
    updateFieldLabel: PropTypes.func,
    updateFieldType: PropTypes.func,
    removeField: PropTypes.func,
    reorderFields: PropTypes.func, // 👈 important
  }).isRequired,
};
