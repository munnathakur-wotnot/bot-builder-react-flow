import React from "react";
import "./ActionCard.css";
import PropTypes from "prop-types";
import { createEdge } from "../../Canvas/utils";
import useNodeUpdater from "../../../hooks/useNodeUpdater";
import { useFlowCallbacks } from "../../Canvas/FlowCallbacksContext";

export default function AiMenu({
    menuState,
    setMenuState,
    setNodes,
    edges,
    setEdges,
}) {
    const nodeId = menuState?.nodeId;
    const isSelfLoop = menuState?.isSelfLoop;
    const { updateNode } = useNodeUpdater({ nodeId: nodeId, setNodes });
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
            updateNode({ successOutport: [nodeId] });
        } else {
            deleteEdge?.(connectedEdge.id, nodeId, nodeId);
            updateNode({ successOutport: [] });
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
                <span className="icon rotate">{!isSelfLoop ? "↻" : "x"}</span>
                <span className="label">
                    {!isSelfLoop ? "Self loop" : "Remove Self Loop"}
                </span>
            </div>

            {!isSelfLoop && (
                <div
                    className="action-item"
                    style={isSelfLoop ? { color: "red" } : {}}
                    onClick={onAddBlock}
                >
                    <span className="icon plus">＋</span>
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
