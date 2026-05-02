import PropTypes from "prop-types";
import React from "react";
import DragDropList from "../../../../shared/ui/molecules/ListDragDrop";
import FieldRow from "./FormField";

export default function FormFields({ nodeData, formHandlers, onNavigate }) {
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
            onRemove={formHandlers.removeField}
            onNavigate={onNavigate}
          />
        )}
      />
    </div>
  );
}

FormFields.propTypes = {
  nodeData: PropTypes.object,
  formHandlers: PropTypes.shape({
    removeField: PropTypes.func,
    reorderFields: PropTypes.func,
  }).isRequired,
  onNavigate: PropTypes.func,
};
