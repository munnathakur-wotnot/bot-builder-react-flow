import React from "react";
import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import "./CustonEdge.css";
import { useFlowCallbacks } from "../Canvas/FlowCallbacksContext.jsx";
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
    selected,
    data,
  } = props;

  const { deleteEdge } = useFlowCallbacks();

  const isDeletableEdges = data.isNotDeletable;
  console.log(data, "DataIsAvaliable");

  // Force all outgoing edges to share a common "trunk" segment from the source,
  // then split horizontally. This matches a clean tree visual.
  const trunkLen = 42;
  const dir = targetY >= sourceY ? 1 : -1;
  const trunkY = sourceY + dir * trunkLen;

  const edgePath = `M ${sourceX} ${sourceY} L ${sourceX} ${trunkY} L ${targetX} ${trunkY} L ${targetX} ${targetY}`;

  const labelX = (sourceX + targetX) / 2;
  const labelY = trunkY;

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteEdge?.(id, source, target);
  };

  return (
    <>
      <BaseEdge path={edgePath} />

      {!isDeletableEdges && (
        <EdgeLabelRenderer>
          <div
            className={`edge-icon-wrapper${selected ? " selected" : ""}`}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            <button className="edge-icon-btn" onClick={handleDelete}>
              ✕
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
CustomEdge.propTypes = {
  id: PropTypes.string,
  source: PropTypes.number,
  target: PropTypes.number,
  sourceX: PropTypes.number,
  sourceY: PropTypes.number,
  targetX: PropTypes.number,
  targetY: PropTypes.number,
  selected: PropTypes.number,
  data: PropTypes.object,
};
