import React from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";
import "./CustonEdge.css";

export default function CustomEdge(props) {
    const {
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    } = props;

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
    });
    return (
        <>
            {/* Edge Line */}
            <BaseEdge path={edgePath} />

            {/* Hover Icon */}
            <EdgeLabelRenderer>
                <div
                    onClick={() => console.log("Edge clicked: hello", id)}
                    className="edge-icon-wrapper"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                    }}
                >
                    <button className="edge-icon-btn">⚙️ Hello bhai</button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
