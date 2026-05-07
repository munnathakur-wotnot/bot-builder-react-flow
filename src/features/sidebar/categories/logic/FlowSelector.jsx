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
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </button>
    </div>
  );
}

FlowSelector.propTypes = {
  selectedNode: PropTypes.object,
  updateNode: PropTypes.func,
  onEnterFlow: PropTypes.func,
};


FlowSelector.propTypes = {
  selectedNode: PropTypes.object,
  updateNode: PropTypes.func,
  onEnterFlow: PropTypes.func,
};
