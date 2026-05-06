import React from "react";
import PropTypes from "prop-types";
import SelectDropdown from "./SelectDropdown";

export default function AiKbDropdown({ nodeData, handlers, onNavigate }) {
  const knowledgeBases = nodeData?.knowledgeBases ?? [];
  const knowledgeBaseId = nodeData?.knowledgeBaseId ?? null;

  const handleCreate = () => {
    const id = handlers.ai.createKb();
    if (id) onNavigate?.({ id, _type: "kb" });
  };

  return (
    <SelectDropdown
      label="Knowledge base"
      options={knowledgeBases}
      value={knowledgeBaseId}
      placeholder="Select KB"
      onSelect={(id) => handlers.ai.selectKb(id)}
      onCreate={handleCreate}
      onEdit={(kb) => onNavigate?.({ id: kb.id, _type: "kb" })}
      createLabel="Create Knowledge Base"
      error={!knowledgeBaseId ? "Knowledge base selection is required" : ""}
    />
  );
}
AiKbDropdown.propTypes = {
  nodeData: PropTypes.object,
  handlers: PropTypes.object.isRequired,
  onNavigate: PropTypes.func,
};