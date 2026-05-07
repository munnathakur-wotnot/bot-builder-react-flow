import React from "react";
import "./JumpCard.css";
import PropTypes from "prop-types";

export default function FlowSelector({ selectedNode, updateNode, onEnterFlow }) {
  const title = selectedNode.data?.title ?? "";
  const targetFlowId = selectedNode.data?.targetFlowId;

  return (
    <div className="jump-card flow-selector-card">
      <p className="jump-card__desc">
        Creates a flow to organize and manage complex conversation logic more
        effectively.
      </p>

      <div className="jump-card__field">
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateNode({ title: e.target.value })}
          placeholder="Flow name"
        />
      </div>

      <button
        className="jump-card__enter-btn flow-selector-card__enter"
        onClick={() => onEnterFlow && onEnterFlow(targetFlowId)}
        disabled={!targetFlowId}
      >
        Enter flow
      </button>
    </div>
  );
}

FlowSelector.propTypes = {
  selectedNode: PropTypes.object,
  updateNode: PropTypes.func,
  onEnterFlow: PropTypes.func,
};
