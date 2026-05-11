import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "@xyflow/react";
import "./CustomNode.css";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext.jsx";
import NodeTooltips from "./NodeTooltips.jsx";
import { useSimulationStatus } from "../../shared/hooks/useSimulationStatus";
import { isEqual } from "lodash";

/** Format a unix-ms timestamp into a short relative string */
function formatRelativeTime(ts) {
  if (!ts) return "";
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function CustomNode({ id, data }) {
  const { openMenu, validationErrors, simulationStore, isHandleClickRef } =
    useFlowCallbacks();

  // only this node re-renders when ITS simulation status changes
  const simulationStatus = useSimulationStatus(simulationStore, id);
  const isActive = simulationStatus === "active";
  const isExecuted = simulationStatus === "executed";

  const nodeErrors = validationErrors?.current?.[id] ?? [];
  const hasErrors = data.isErrorShow && nodeErrors.length > 0;

  const isStartNode = data.type === "start" || data.type === "flowStart";
  const isConnected = data?.connected;
  const isDoubleOutport = data?.doubleHandler ?? false;
  const isSelfLoop = data?.successOutport?.[0] === id;

  const hasSuccessOutport = data?.successOutport?.length > 0;
  const hasFailureOutport = data?.failureOutport?.length > 0;

  const hasOutgoing = isDoubleOutport
    ? hasSuccessOutport && hasFailureOutport
    : data.outPorts?.length > 0;

  // Safe menu open — centers on node X
  const handleOpenMenu = useCallback(
    ({ event, type, isSelfLoop, isMenuOpen }) => {
      event?.stopPropagation();

      // event.currentTarget is null in mouseup callbacks — use event.target only
      const nodeEl = event?.target?.closest?.(".react-flow__node");
      const rect = nodeEl?.getBoundingClientRect();
      const centerX = rect ? rect.left + rect.width / 2 : event?.clientX;

      openMenu({
        nodeId: id,
        x: centerX,
        y: rect ? rect.bottom + 8 : (event?.clientY ?? 0) + 20,
        type,
        isSelfLoop,
        isMenuOpen,
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
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
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
          isHandleClickRef.current = true;
          handleOpenMenu({
            event: upEvent,
            type: type,
            isSelfLoop,
            isMenuOpen: true,
          });
        }

        requestAnimationFrame(() => {
          isHandleClickRef.current = false;
        });

        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleOpenMenu, hasOutgoing, isSelfLoop, isHandleClickRef],
  );

  const isSubNode = data?.isSubNode;
  const showToolbar = !isStartNode && !isSubNode;
  const selectedBy = data?.selectedBy ?? null;
  const selectedByColor = data?.selectedByColor ?? null;
  const isDraggedBy = data?.isDraggedBy ?? null;
  const isDraggedByColor = data?.isDraggedByColor ?? null;
  const isMenuOpenBy = data?.isMenuOpenBy ?? null;
  const isMenuOpenByColor = data?.isMenuOpenByColor ?? null;

  // If another remote user is dragging this node, make it non-draggable locally
  const isLockedByRemote = Boolean(isDraggedBy);

  if (!data) return null;

  const typeClassName = [
    `custom-node custom-node--${data.type ?? "default"}`,
    data.isSearchHighlight ? "custom-node--search-highlight" : "",
    hasErrors ? "custom-node--has-errors" : "",
    isActive ? "custom-node--executing" : "",
    isExecuted ? "custom-node--executed" : "",
    isLockedByRemote ? "custom-node--drag-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const isSmallPill =
    data.type === "delay" ||
    data.type === "jump" ||
    data.type === "flow" ||
    data.type === "flowStart";
  const titleClassName = isSmallPill
    ? "custom-node__header-delay"
    : "custom-node__header";
  const titleTextClassName = isSmallPill
    ? "small-node-title"
    : "custom-node__title";

  // Priority: drag lock > menu open > selected-by for border color
  const borderColor = isDraggedByColor || isMenuOpenByColor || selectedByColor;
  const remoteUserStyle = borderColor
    ? {
      border: `2px solid ${borderColor}`,
      boxShadow: `0 0 0 3px ${borderColor}33`,
    }
    : {};

  return (
    <div
      className={typeClassName}
      style={
        isSubNode ? { width: "120px", ...remoteUserStyle } : remoteUserStyle
      }
      data-locked={isLockedByRemote ? "true" : undefined}
      onClick={
        isStartNode && !isConnected
          ? (e) => handleOpenMenu({ event: e })
          : undefined
      }
      onKeyDown={isStartNode && !isConnected ? handleKeyDown : undefined}
      role={isStartNode && !isConnected ? "button" : undefined}
      tabIndex={isStartNode && !isConnected ? 0 : undefined}
    >
      {/* Drag-lock overlay — blocks interaction while another user drags */}
      {isLockedByRemote && <div className="custom-node__drag-lock-overlay" />}

      {/* Dragging badge */}
      {isDraggedBy && (
        <div
          className="custom-node__remote-user-badge custom-node__remote-user-badge--dragging"
          style={{ background: isDraggedByColor }}
        >
          <span
            className="custom-node__remote-user-avatar"
            style={{ background: isDraggedByColor }}
          >
            {isDraggedBy[0]?.toUpperCase()}
          </span>
          ✦ {isDraggedBy} is dragging
        </div>
      )}

      {/* Menu-open badge */}
      {!isDraggedBy && isMenuOpenBy && (
        <div
          className="custom-node__remote-user-badge custom-node__remote-user-badge--menu"
          style={{ background: isMenuOpenByColor }}
        >
          <span
            className="custom-node__remote-user-avatar"
            style={{ background: isMenuOpenByColor }}
          >
            {isMenuOpenBy[0]?.toUpperCase()}
          </span>
          ☰ {isMenuOpenBy} has menu open
        </div>
      )}

      {/* Selected-by badge */}
      {!isDraggedBy && !isMenuOpenBy && selectedBy && (
        <div
          className="custom-node__remote-user-badge"
          style={{ background: selectedByColor }}
        >
          <span
            className="custom-node__remote-user-avatar"
            style={{ background: selectedByColor }}
          >
            {selectedBy[0]?.toUpperCase()}
          </span>
          {selectedBy}
        </div>
      )}
      {/* Error badge */}
      {hasErrors && !isSubNode && (
        <div className="custom-node__error-badge" title={nodeErrors.join("\n")}>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {nodeErrors.length}
        </div>
      )}
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
      {!isSmallPill && !isSubNode && (
        <p className="custom-node__description">{data.description || ""}</p>
      )}
      {/* Hover toolbar */}
      {showToolbar && <NodeTooltips id={id} />}
      {/* Last-updated / created-by footer */}
      {!isSubNode && (data.lastUpdatedBy || data.createdBy) && (
        <div className="custom-node__activity-footer">
          {data.lastUpdatedBy ? (
            <span
              className="custom-node__activity-chip"
              style={{ borderColor: data.lastUpdatedBy.color }}
              title={`Last updated by ${data.lastUpdatedBy.name}`}
            >
              <span
                className="custom-node__activity-avatar"
                style={{ background: data.lastUpdatedBy.color }}
              >
                {data.lastUpdatedBy.name?.[0]?.toUpperCase()}
              </span>
              <span className="custom-node__activity-label">
                {data.lastUpdatedBy.name} · {formatRelativeTime(data.lastUpdatedBy.at)}
              </span>
            </span>
          ) : data.createdBy ? (
            <span
              className="custom-node__activity-chip"
              style={{ borderColor: data.createdBy.color }}
              title={`Created by ${data.createdBy.name}`}
            >
              <span
                className="custom-node__activity-avatar"
                style={{ background: data.createdBy.color }}
              >
                {data.createdBy.name?.[0]?.toUpperCase()}
              </span>
              <span className="custom-node__activity-label">
                {data.createdBy.name} · created
              </span>
            </span>
          ) : null}
        </div>
      )}
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

  if (!prevData || !nextData) {
    return prevData === nextData;
  }

  return (
    prevData.title === nextData.title &&
    prevData.description === nextData.description &&
    prevData.type === nextData.type &&
    isEqual(prevData.outPorts, nextData.outPorts) &&
    isEqual(prevData.inPorts, nextData.inPorts) &&
    prevData.delayDuration === nextData.delayDuration &&
    isEqual(prevData.successOutport, nextData.successOutport) &&
    isEqual(prevData.failureOutport, nextData.failureOutport) &&
    isEqual(prevData.cards, nextData.cards) &&
    isEqual(prevData.fields, nextData.fields) &&
    isEqual(prevData.knowledgeBaseId, nextData.knowledgeBaseId) &&
    isEqual(prevData.functionIds, nextData.functionIds) &&
    prevData.isErrorShow === nextData.isErrorShow &&
    prevData.isSearchHighlight === nextData.isSearchHighlight &&
    prevData.selectedBy === nextData.selectedBy &&
    prevData.selectedByColor === nextData.selectedByColor &&
    prevData.isDraggedBy === nextData.isDraggedBy &&
    prevData.isDraggedByColor === nextData.isDraggedByColor &&
    prevData.isMenuOpenBy === nextData.isMenuOpenBy &&
    prevData.isMenuOpenByColor === nextData.isMenuOpenByColor &&
    prevData.lastUpdatedBy?.at === nextData.lastUpdatedBy?.at &&
    prevData.createdBy?.id === nextData.createdBy?.id
  );
});

CustomNode.displayName = "CustomNode";
