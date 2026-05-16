import React from "react";
import "./ActionCard.css";
import PropTypes from "prop-types";
import { createEdge, applyConnectionToNodes } from "../canvas/newUtils";
import { useFlowCallbacks } from "../canvas/FlowCallbacksContext";

export default function AiMenu({
    menuState,
    setMenuState,
    setNodes,
    edges,
    setEdges,
}) {
    const nodeId = menuState?.nodeId;
    const isSelfLoop = menuState?.isSelfLoop;
    const { deleteEdge } = useFlowCallbacks();

    const connectedEdge = edges.find(
        (e) => e.source === nodeId && e.target === nodeId,
    );
    const onAddBlock = () => {
        setMenuState((menu) => ({ ...menu, addAnother: true }));
    };
    const onSelfLoop = () => {
        if (!isSelfLoop) {
            const newEdge = createEdge(nodeId, nodeId, false, menuState.type, true);
            setEdges((edges) => [...edges, newEdge]);
            // Update the output port's links to include the self-reference
            setNodes((nds) =>
                applyConnectionToNodes(nds, {
                    source: nodeId,
                    target: nodeId,
                    sourceHandle: menuState.type,
                }),
            );
        } else {
            deleteEdge?.(connectedEdge.id, nodeId, nodeId);
            // removeNodeConnectionsForEdges (called inside deleteEdge) cleans port links
        }
        setMenuState(null);
    };
    return (
        <div
            className="context-menu"
            style={{ top: menuState.y + 30, left: menuState.x - 100 }}
            role="menu"
        >
            <div className="action-item" onClick={onSelfLoop}>
                <span className="icon rotate">{!isSelfLoop ? "↻" : "✕"}</span>
                <span className="label">
                    {!isSelfLoop ? "Self loop" : "Remove Self Loop"}
                </span>
            </div>

            {!isSelfLoop && (
                <div className="action-item" onClick={onAddBlock}>
                    <span className="icon plus">+</span>
                    <span className="label">Add another block</span>
                </div>
            )}
        </div>
    );
}

AiMenu.propTypes = {
    onSelfLoop: PropTypes.func,
    onAddBlock: PropTypes.func,
    menuState: PropTypes.func,
    setMenuState: PropTypes.func,
    setNodes: PropTypes.func,
    edges: PropTypes.func,
    setEdges: PropTypes.func,
};
