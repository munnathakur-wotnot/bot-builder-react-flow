import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
} from "@xyflow/react";
import "./CustomEdge.css";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext.jsx";
import PropTypes from "prop-types";

export default function CustomEdge(props) {
  const {
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    data,
    sourceHandleId,
  } = props;

  const { deleteEdge } = useFlowCallbacks();
  //Used to delay hiding the delete button (smooth UX).
  const hideTimeoutRef = useRef(null);
  const [hoverState, setHoverState] = useState({
    isVisible: false,
    x: 0,
    y: 0,
  });

  const isDeletableEdges = data?.isNotDeletable;
  const isVerticalChain = Math.abs(sourceX - targetX) < 2;
  const [edgePath, fallbackX, fallbackY] = isVerticalChain
    ? getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    })
    : getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      borderRadius: 24,
      offset: 30,
    });

  const handleDelete = (e) => {
    e.stopPropagation();

    deleteEdge?.(id, source, target, sourceHandleId);
  };

  const clearHideTimeout = useCallback(() => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const showDeleteButton = useCallback(
    (event) => {
      clearHideTimeout();
      const svg = event.currentTarget.ownerSVGElement;
      const ctm = svg?.getScreenCTM();

      if (!svg || !ctm) {
        setHoverState({
          isVisible: true,
          x: fallbackX,
          y: fallbackY,
        });
        return;
      }

      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;

      const svgPoint = point.matrixTransform(ctm.inverse());

      setHoverState({
        isVisible: true,
        x: svgPoint.x,
        y: svgPoint.y,
      });
    },
    [clearHideTimeout, fallbackX, fallbackY],
  );

  const hideDeleteButton = useCallback(() => {
    clearHideTimeout();
    hideTimeoutRef.current = window.setTimeout(() => {
      setHoverState((prev) => ({ ...prev, isVisible: false }));
    }, 120);
  }, [clearHideTimeout]);

  useEffect(
    () => () => {
      clearHideTimeout();
    },
    [clearHideTimeout],
  );

  return (
    <>
      <BaseEdge path={edgePath} />
      {!isDeletableEdges && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.001)"
          strokeWidth={24}
          className="edge-hitbox"
          pointerEvents="stroke"
          onMouseEnter={showDeleteButton}
          onMouseMove={showDeleteButton}
          onMouseLeave={hideDeleteButton}
        />
      )}

      {!isDeletableEdges && hoverState.isVisible && (
        <EdgeLabelRenderer>
          <div
            className="edge-icon-wrapper nodrag nopan"
            style={{
              pointerEvents: "all",
              transform: `translate(-50%, -50%) translate(${hoverState.x}px, ${hoverState.y}px)`,
            }}
            onMouseEnter={clearHideTimeout}
            onMouseLeave={hideDeleteButton}
          >
            <button
              className="edge-icon-btn"
              onClick={handleDelete}
              aria-label="Delete edge"
              type="button"
            >
              <span className="edge-icon-btn__trash" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9zm-1 10h12l1-12H5l1 12z" />
                </svg>
              </span>
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
CustomEdge.propTypes = {
  id: PropTypes.string,
  source: PropTypes.string,
  target: PropTypes.string,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
  sourceHandleId: PropTypes.string,
  data: PropTypes.object,
};
