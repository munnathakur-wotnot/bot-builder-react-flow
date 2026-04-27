import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";
import { useFlowCallbacks } from "../Canvas/FlowCallbacksContext.jsx";

function CustomNode({ id, data }) {
  const { openMenu } = useFlowCallbacks();
  const isStartNode = data.type === "start";
  const hasOutgoing = data.outPorts?.length > 0;
  const showDescription = Boolean(data.description);

  //  Stable click handler
  const handleOpenMenu = useCallback(
    (event) => {
      event.stopPropagation();
      openMenu({
        nodeId: id,
        x: event.clientX,
        y: event.clientY + 10,
      });
    },
    [id, openMenu],
  );

  // Stable keyboard handler (no inline function)
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const rect = event.currentTarget.getBoundingClientRect();

        openMenu({
          nodeId: id,
          x: rect.left + 80,
          y: rect.bottom + 10,
        });
      }
    },
    [id, openMenu],
  );
  if (!data) return null;

  const typeClassName = `custom-node custom-node--${data.type ?? "default"}`;

  return (
    <div
      className={typeClassName}
      onClick={isStartNode ? handleOpenMenu : undefined}
      onKeyDown={isStartNode ? handleKeyDown : undefined}
      role={isStartNode ? "button" : undefined}
      tabIndex={isStartNode ? 0 : undefined}
    >
      {/* Target Handle */}
      {!isStartNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="custom-node__handle custom-node__handle--target"
        />
      )}

      {/* Header */}
      <div className="custom-node__header">
        <div className="custom-node__icon" />
        <p className="custom-node__title">{data.title}</p>
      </div>

      {/* Description */}
      {showDescription && (
        <p className="custom-node__description">{data.description}</p>
      )}

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`custom-node__handle custom-node__handle--source ${hasOutgoing ? "custom-node__handle--source-hidden" : ""
          }`}
        isConnectable={!hasOutgoing}
        onClick={!isStartNode && !hasOutgoing ? handleOpenMenu : undefined}
      />
    </div>
  );
}

CustomNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default memo(CustomNode, (prev, next) => {
  //  Custom comparison

  // same id
  if (prev.id !== next.id) return false;

  // shallow compare important fields only
  const prevData = prev.data;
  const nextData = next.data;

  return (
    prevData.title === nextData.title &&
    prevData.description === nextData.description &&
    prevData.type === nextData.type &&
    prevData.outPorts === nextData.outPorts && // reference check (fast)
    prevData.inPorts === nextData.inPorts
  );
});
CustomNode.displayName = "CustomNode";
