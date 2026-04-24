import React from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";

export default function CustomNode({ id, data }) {
  const nodeData = data;

  if (!nodeData) return null;

  console.log(nodeData, "nodeData-inCustum");

  const isStartNode = nodeData.type === "start";
  const typeClassName = `custom-node--${nodeData.type ?? "default"}`;
  const showDescription = Boolean(nodeData.description);
  console.log(nodeData, "NodeDataInPlus");
  const showPlus = nodeData?.connected;
  console.log(showPlus, "PPP");
  console.log(nodeData, "NodeData");

  return (
    <div
      className={`custom-node ${typeClassName}`}
      onClick={
        isStartNode && !showPlus
          ? (event) => {
            event.stopPropagation();
            data.onOpenMenu({
              nodeId: id,
              x: event.clientX,
              y: event.clientY + 10,
            });
          }
          : undefined
      }
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
      {!isStartNode && !showPlus ? (
        <Handle
          type="target"
          position={Position.Top}
          className="custom-node__handle custom-node__handle--target"
        />
      ) : null}

      <div className="custom-node__header">
        <div className="custom-node__icon" />
        <p className="custom-node__title">{nodeData.title}</p>
      </div>

      {showDescription ? (
        <p className="custom-node__description">{nodeData.description}</p>
      ) : null}

      {!showPlus && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="custom-node__handle custom-node__handle--source"
        />
      )}

      {!isStartNode && !showPlus ? (
        <button
          type="button"
          className="custom-node__add-button"
          onClick={(event) => {
            console.log(event, "Hello Click Plus");

            event.stopPropagation();
            data.onOpenMenu({
              nodeId: id,
              x: event.clientX,
              y: event.clientY + 10,
            });
          }}
        >
          +
        </button>
      ) : null}
    </div>
  );
}

CustomNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.shape({
    nodeDataMap: PropTypes.objectOf(
      PropTypes.shape({
        type: PropTypes.string,
        title: PropTypes.string,
        description: PropTypes.string,
        connected: PropTypes.bool,
      }),
    ).isRequired,
    onOpenMenu: PropTypes.func.isRequired,
  }).isRequired,
};
