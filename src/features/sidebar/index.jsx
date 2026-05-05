import PropTypes from "prop-types";
import React, { memo } from "react";
import { CATEGORY_CONFIGS } from "./utils/categoryConfigs";
import NodeSidebar from "./NodeSidebar";
import useNodeUpdater from "../../shared/hooks/useNodeUpdater";

function SidebarIndex({
    selectedNodeId,
    nodes,
    setNodes,
    onClose,
    ...rest // all other props (edges, setEdges, getNextNodeId, …) forwarded as-is
}) {
    const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
    const { updateNode } = useNodeUpdater({
        nodeId: selectedNode?.id,
        setNodes,
    });

    const iCategory = selectedNode?.data?.iCategory;
    const nodeType = selectedNode?.data?.type;
    const categoryConfig = CATEGORY_CONFIGS[iCategory];

    const sidebarProps = {
        ...rest,
        selectedNodeId,
        nodes,
        setNodes,
        onClose,
        selectedNode, // derived — always the live object
        updateNode, // derived — stable updater for the selected node
    };

    // getSidebarComponent receives nodeType + the full prop set and returns
    // { Component, props } — each config decides which component and which props it needs.
    const { Component: RenderNodeClicker, props: componentProps } = categoryConfig
        ? categoryConfig.getSidebarComponent(nodeType, sidebarProps)
        : { Component: NodeSidebar, props: sidebarProps };

    return <RenderNodeClicker {...componentProps} />;
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

// Memo: all props passed from Canvas are stable references (setters, stable
// callbacks, deferred nodes). Bails out during drag/pan so nodes.find() and
// child component re-renders don't run 60x/s.
export default memo(SidebarIndex);
