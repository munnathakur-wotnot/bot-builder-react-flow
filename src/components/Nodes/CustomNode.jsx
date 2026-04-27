import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";
import { useFlowCallbacks } from "../Canvas/FlowCallbacksContext.jsx";

function CustomNode({ id, data }) {
  const nodeData = data;
  const { openMenu } = useFlowCallbacks();

  const isStartNode = nodeData.type === "start";
  const typeClassName = `custom-node--${nodeData.type ?? "default"}`;
  const showDescription = Boolean(nodeData.description);

  const onOpenMenu = useCallback(
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
  if (!nodeData) return null;

  return (
    <div
      className={`custom-node ${typeClassName}`}
      onClick={isStartNode ? onOpenMenu : undefined}
      role={isStartNode ? "button" : undefined}
      tabIndex={isStartNode ? 0 : undefined}
      onKeyDown={
        isStartNode
          ? (event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openMenu({
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
        className={`custom-node__handle custom-node__handle--source${nodeData.outPorts?.length > 0
            ? " custom-node__handle--source-hidden"
            : ""
          }`}
        isConnectable={!(nodeData.outPorts?.length > 0)}
        onClick={
          !isStartNode && !(nodeData.outPorts?.length > 0)
            ? onOpenMenu
            : undefined
        }
      />
    </div>
  );
}

const MemoCustomNode = memo(CustomNode);
CustomNode.propTypes = {
  id: PropTypes.string,
  data: PropTypes.object,
};

export default MemoCustomNode;
