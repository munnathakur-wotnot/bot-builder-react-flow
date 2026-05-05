import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext.jsx";
import NodeTooltips from "./NodeTooltips.jsx";

function CustomNode({ id, data }) {
  const { openMenu } = useFlowCallbacks();

  const isStartNode = data.type === "start";
  const isConnected = data?.connected;
  const isDoubleOutport = data?.doubleHandler ?? false;
  const isSelfLoop = data?.successOutport?.[0] === id;

  const hasSuccessOutport = data?.successOutport?.length > 0;
  const hasFailureOutport = data?.failureOutport?.length > 0;

  const hasOutgoing = isDoubleOutport
    ? hasSuccessOutport && hasFailureOutport
    : data.outPorts?.length > 0;

  const showDescription = Boolean(data?.description);

  // Safe menu open
  const handleOpenMenu = useCallback(
    ({ event, type, isSelfLoop }) => {
      event?.stopPropagation();

      openMenu({
        nodeId: id,
        x: event?.clientX,
        y: event?.clientY + 10,
        type,
        isSelfLoop,
      });
    },
    [id, openMenu],
  );

  //  Keyboard support
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

  // Click vs Drag detection (IMPORTANT)
  const handleMouseDown = useCallback(
    (e, type) => {
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;

      const handleMouseUp = (upEvent) => {
        const dx = Math.abs(upEvent.clientX - startX);
        const dy = Math.abs(upEvent.clientY - startY);

        // treat as click if small movement
        if (dx < 5 && dy < 5 && !hasOutgoing) {
          handleOpenMenu({ event: upEvent, type: type, isSelfLoop });
        }

        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleOpenMenu, hasOutgoing, isSelfLoop],
  );

  const isSubNode = data?.isSubNode;
  const showToolbar = !isStartNode && !isSubNode;

  if (!data) return null;

  const typeClassName = `custom-node custom-node--${data.type ?? "default"}`;
  const titleClassName =
    data.type === "delay" || data.type === "jump"
      ? "custom-node__header-delay"
      : "custom-node__header";
  const titleTextClassName =
    data.type === "delay" || data.type === "jump"
      ? "small-node-title"
      : "custom-node__title";

  return (
    <div
      className={typeClassName}
      style={isSubNode ? { width: "120px" } : {}}
      onClick={
        isStartNode && !isConnected
          ? (e) => handleOpenMenu({ event: e })
          : undefined
      }
      onKeyDown={isStartNode && !isConnected ? handleKeyDown : undefined}
      role={isStartNode && !isConnected ? "button" : undefined}
      tabIndex={isStartNode && !isConnected ? 0 : undefined}
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
      <div className={titleClassName}>
        {!data.icon && !isSubNode && <div className="custom-node__icon" />}
        <p className={titleTextClassName}>
          <span>{data.icon}</span>
          {data.title} {data.delayDuration ? `(${data.delayDuration}s)` : ""}
        </p>
      </div>

      {/* Description */}
      {showDescription && (
        <p className="custom-node__description">{data.description}</p>
      )}

      {/* Hover toolbar */}
      {showToolbar && <NodeTooltips id={id} />}

      {/* Source Handles */}
      {isDoubleOutport ? (
        <>
          <Handle
            type="source"
            id="success"
            position={Position.Bottom}
            style={
              isStartNode && isConnected
                ? { visibility: "hidden", left: "30%" }
                : { left: "30%" }
            }
            className={`custom-node__handle custom-node__handle--source success-node-handler ${isSelfLoop
                ? "custom-node__handle--self-loop"
                : hasSuccessOutport
                  ? "custom-node__handle--source-connected"
                  : "custom-node__handle--source-add"
              }`}
            isConnectable={!hasSuccessOutport || isSelfLoop}
            onMouseDown={(e) => handleMouseDown(e, "success")}
          />

          <Handle
            type="source"
            id="failure"
            position={Position.Bottom}
            style={
              isStartNode && isConnected
                ? { visibility: "hidden", left: "70%" }
                : { left: "70%" }
            }
            className={`custom-node__handle custom-node__handle--source failed-node-handler ${hasFailureOutport
                ? "custom-node__handle--source-connected"
                : "custom-node__handle--source-add"
              }`}
            isConnectable={!hasFailureOutport}
            onMouseDown={(e) => handleMouseDown(e, "failure")}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={isStartNode && isConnected ? { visibility: "hidden" } : {}}
          className={`custom-node__handle custom-node__handle--source ${hasOutgoing
              ? "custom-node__handle--source-connected"
              : "custom-node__handle--source-add"
            }`}
          isConnectable={true}
          id={"default"}
          onMouseDown={handleMouseDown}
        />
      )}
    </div>
  );
}

CustomNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default memo(CustomNode, (prev, next) => {
  if (prev.id !== next.id) return false;

  const prevData = prev.data;
  const nextData = next.data;

  if (!prevData || !nextData) return prevData === nextData;

  return (
    prevData.title === nextData.title &&
    prevData.description === nextData.description &&
    prevData.type === nextData.type &&
    prevData.outPorts === nextData.outPorts &&
    prevData.inPorts === nextData.inPorts &&
    prevData.delayDuration === nextData.delayDuration &&
    prevData?.successOutport === nextData?.successOutport &&
    prevData?.failureOutport === nextData?.failureOutport
  );
});

CustomNode.displayName = "CustomNode";
