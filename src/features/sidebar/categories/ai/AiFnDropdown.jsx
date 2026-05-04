import React from "react";
import PropTypes from "prop-types";
import SelectDropdown from "./SelectDropdown";
import "./AiAnswerSidebar.css";

export default function AiFnDropdown({ nodeData, handlers, onNavigate }) {
  const availableFunctions = nodeData?.availableFunctions ?? [];
  const functionIds = nodeData?.functionIds ?? [];

  const handleCreate = () => {
    const id = handlers.ai.createFunction();
    if (id) onNavigate?.({ id, _type: "fn" });
  };

  return (
    <SelectDropdown
      label="Execute function(s)"
      showInfo
      options={availableFunctions}
      value={functionIds}
      multiSelect
      placeholder="Select functions"
      onSelect={(ids) => handlers.ai.selectFunctions(ids)}
      onCreate={handleCreate}
      onEdit={(fn) => onNavigate?.({ id: fn.id, _type: "fn" })}
      createLabel="Create Function"
    />
  );
}
AiFnDropdown.propTypes = {
  nodeData: PropTypes.object,
  handlers: PropTypes.object.isRequired,
  onNavigate: PropTypes.func,
};
