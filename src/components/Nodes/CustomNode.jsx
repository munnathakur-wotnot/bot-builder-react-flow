import React from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";

export default function CustomNode({ id, data }) {
  const nodeData = data;

  if (!nodeData) return null;

  const isStartNode = nodeData.type === "start";
  const typeClassName = `custom-node--${nodeData.type ?? "default"}`;
  const showDescription = Boolean(nodeData.description);

  const openMenu = (event) => {
    event.stopPropagation();
    data.onOpenMenu({
      nodeId: id,
      x: event.clientX,
      y: event.clientY + 10,
    });
  };

  return (
    <div
      className={`custom-node ${typeClassName}`}
      onClick={isStartNode ? openMenu : undefined}
      role={isStartNode ? "button" : undefined}
      tabIndex={isStartNode ? 0 : undefined}
      onKeyDown={
        isStartNode
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                data.onOpenMenu({
                  nodeId: id,
                  x: event.currentTarget.getBoundingClientRect().left + 80,
                  y: event.currentTarget.getBoundingClientRect().bottom + 10,
                });
              }
            }
          : undefined
      }
    >
      {/* Target handle — always visible on non-start nodes */}
      {!isStartNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="custom-node__handle custom-node__handle--target"
        />
      )}

      <div className="custom-node__header">
        <div className="custom-node__icon" />
        <p className="custom-node__title">{nodeData.title}</p>
      </div>

      {showDescription && (
        <p className="custom-node__description">{nodeData.description}</p>
      )}

      {/* Source handle — always in DOM so React Flow positions edges correctly.
          Visually shown as + only when not yet connected. */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`custom-node__handle custom-node__handle--source${
          nodeData.outPorts?.length > 0 ? " custom-node__handle--source-hidden" : ""
        }`}
        isConnectable={!(nodeData.outPorts?.length > 0)}
        onClick={!isStartNode && !(nodeData.outPorts?.length > 0) ? openMenu : undefined}
      />
    </div>
  );
}

CustomNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    onOpenMenu: PropTypes.func.isRequired,
  }).isRequired,
};
