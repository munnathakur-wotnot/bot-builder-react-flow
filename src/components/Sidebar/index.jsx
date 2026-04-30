import PropTypes from "prop-types";
import React from "react";
import { renderSidebarMapping } from "./helper";
import useNodeUpdater from "../../hooks/useNodeUpdater";
import NodeSidebar from "./NodeSidebar";
import DurationSelector from "./delay";

const RENDER_MAPPING = {
    delay: DurationSelector,
    default: NodeSidebar,
};

export default function SidebarIndex({
    selectedNodeId,
    nodes,
    edges,
    setNodes,
    setEdges,
    getNextNodeId,
    onClose,
}) {
    const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
    const { updateNode } = useNodeUpdater({
        nodeId: selectedNode?.id,
        setNodes,
    });

    const type = renderSidebarMapping(selectedNode?.data?.type);
    const RenderNodeClicker = RENDER_MAPPING[type];
    return (
        <RenderNodeClicker
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            edges={edges}
            setNodes={setNodes}
            setEdges={setEdges}
            getNextNodeId={getNextNodeId}
            onClose={onClose}
            updateNode={updateNode}
            selectedNode={selectedNode}
        />
    );
}

SidebarIndex.propTypes = {
    selectedNodeId: PropTypes.string,
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
