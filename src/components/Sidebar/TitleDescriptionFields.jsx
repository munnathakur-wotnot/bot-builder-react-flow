import React from "react";

export default function TitleDescriptionFields({ nodeData, updateNode }) {
  return (
    <>
      <label className="node-sidebar__label">
        Title
        <input
          className="node-sidebar__input"
          value={nodeData.title ?? ""}
          onChange={(e) => updateNode({ title: e.target.value })}
        />
      </label>
      <label className="node-sidebar__label">
        Description
        <textarea
          className="node-sidebar__textarea"
          value={nodeData.description ?? ""}
          onChange={(e) => updateNode({ description: e.target.value })}
        />
      </label>
    </>
  );
}
