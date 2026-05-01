import PropTypes from "prop-types";
import React from "react";
import { RENDER_MAPPING, renderSidebarMapping } from "./helper";
import useNodeUpdater from "../../hooks/useNodeUpdater";

export default function SidebarIndex({
    selectedNodeDetails,
    nodes,
    edges,
    setNodes,
    setEdges,
    getNextNodeId,
    onClose,
}) {
    console.log(selectedNodeDetails, "SelectedNodeDetails");

    const selectedNode =
        nodes.find((n) => n.id === selectedNodeDetails?.nodeId) ?? null;
    const { updateNode } = useNodeUpdater({
        nodeId: selectedNode?.id,
        setNodes,
    });

    const type = renderSidebarMapping(selectedNode?.data?.type);
    const RenderNodeClicker = RENDER_MAPPING[type];
    return (
        <RenderNodeClicker
            selectedNodeDetails={selectedNodeDetails}
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
    selectedNodeDetails: PropTypes.string,
    nodes: PropTypes.array.isRequired,
    edges: PropTypes.array.isRequired,
    setNodes: PropTypes.func.isRequired,
    setEdges: PropTypes.func.isRequired,
    getNextNodeId: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};
