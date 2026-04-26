import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import "./CustonEdge.css";

export default function CustomEdge(props) {
    const {
        id,
        source,
        target,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        selected,
        data,
    } = props;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });

    const handleDelete = (e) => {
        e.stopPropagation();
        data?.onDeleteEdge?.(id, source, target);
    };

    return (
        <>
            {/* Edge Line */}
            <BaseEdge path={edgePath} />

            {/* Delete Icon — visible when edge is selected */}
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
        </>
    );
}
