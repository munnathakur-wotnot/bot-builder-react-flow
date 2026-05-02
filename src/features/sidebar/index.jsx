import PropTypes from "prop-types";
import React from "react";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";
import NodeSidebar from "./NodeSidebar";
import useNodeUpdater from "../../shared/hooks/useNodeUpdater";

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

    const iCategory = selectedNode?.data?.iCategory;
    const nodeType = selectedNode?.data?.type;
    const categoryConfig = CATEGORY_CONFIGS[iCategory];
    const RenderNodeClicker = categoryConfig
        ? categoryConfig.getSidebarComponent(nodeType)
        : NodeSidebar;

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
